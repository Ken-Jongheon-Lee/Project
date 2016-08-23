using UnityEngine;
using System.Threading;
using System.Collections;
using System.Timers;
using NetMQ; // for NetMQConfig
using NetMQ.Sockets;
using NetMQ.Monitoring;
using System.IO;

[System.Serializable]
public class Position
{
    public float x, y;

    public static Position CreateFromJson(string jsonString)
    {
        return JsonUtility.FromJson<Position>(jsonString);
    }
}

public enum Protocol_Type
{
    Respwan,
};

public class IProtocol
{
    public Protocol_Type type;
};

[System.Serializable]
public class PacketRespwan :  IProtocol
{
    Position pos;
    public PacketRespwan() { type = Protocol_Type.Respwan; }
    public Position GetPosition() { return pos;  }

    public static PacketRespwan CreateFromJson(string jsonString)
    {
        return JsonUtility.FromJson<PacketRespwan>(jsonString);
    }
};

enum STATUS
{
    E_LOGIN_REQUIED,
    E_INGAME,
}

public class background : MonoBehaviour
{
    Thread client_thread_;
    private Object thisLock_ = new Object();
    bool stop_thread_ = false;
    public Position m_Position;
    bool m_send;
    string m_key;
    string m_id;

    STATUS m_State = STATUS.E_LOGIN_REQUIED;

    void Start()
    {
        //using (var requestSocket = new RequestSocket())

        m_send = true;
        Debug.Log("Start a request thread.");
        client_thread_ = new Thread(NetMQClient);
        client_thread_.Start();
        m_id = GetUniqueString();


    }
    
    public Stream GenerateStreamFromString(string s)
    {
        MemoryStream stream = new MemoryStream();
        StreamWriter writer = new StreamWriter(stream);
        writer.Write(s);
        writer.Flush();
        stream.Position = 0;
        return stream;
    }

    public void SendSyncReq(RequestSocket req)
    {
        ProjectA.OneMessage syncMsg = new ProjectA.OneMessage();
        syncMsg.pType = ProjectA.OneMessage.ProtocolType.SYNKREQ;
        syncMsg.syncReq = new ProjectA.SyncReq();
        syncMsg.syncReq.key = m_key;
        syncMsg.syncReq.Count = 0;

        using (MemoryStream mem = new MemoryStream())
        {

            ProtoBuf.Serializer.Serialize<ProjectA.OneMessage>(mem, syncMsg);
            req.Send(mem.ToArray());
        }

    }

    public string GetUniqueString()
    {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var stringChars = new char[8];
        

        for (int i = 0; i < stringChars.Length; i++)
        {
            stringChars[i] = chars[Random.RandomRange(0,chars.Length)];
        }

        var finalString = new string(stringChars);
        return finalString;
    }

    public void SendLoginPacket(RequestSocket req)
    {
        ProjectA.OneMessage oneMsg = new ProjectA.OneMessage();
        oneMsg.pType = ProjectA.OneMessage.ProtocolType.LOGINREQ;
        oneMsg.loginReq = new ProjectA.LoginReq();
        oneMsg.loginReq.id = m_id;
        oneMsg.loginReq.pw = "aaaa";


        using (MemoryStream mem = new MemoryStream())
        {
            ProtoBuf.Serializer.Serialize<ProjectA.OneMessage>(mem, oneMsg);
            req.Send(mem.ToArray());
        }
    }

    void PacketProcess(ProjectA.OneMessage receivedMSG, RequestSocket req)
    {
        
        switch (receivedMSG.pType)
        {
            case ProjectA.OneMessage.ProtocolType.LOGINRES:
                m_key = receivedMSG.loginRes.key;
                Debug.Log("Ok ... ProjectA.OneMessage.ProtocolType.LOGINRES key : " + m_key);
                m_State = STATUS.E_INGAME;
               

                break;
            case ProjectA.OneMessage.ProtocolType.SYNKRES:
                {
                    m_Position.x = (float)receivedMSG.syncRes.x;
                    m_Position.y = (float)receivedMSG.syncRes.y;
                    Debug.Log("Received POS x " + m_Position.x + "POS y : " + m_Position.y);


                    
                    break;
                }
        }
        return;
    }

    // Client thread which does not block Update()
    void NetMQClient()
    {
        AsyncIO.ForceDotNet.Force();
        using (var context = NetMQContext.Create())
        //using (var sub = context.CreateSubscriberSocket())
        using (var req = context.CreateRequestSocket())
        {
            // bind the server to a local tcp address
            // server.Bind("tcp://localhost:4231");

            // connect the client to the server
            req.Connect("tcp://127.0.0.1:5433");
            Thread.Sleep(500);

            SendLoginPacket(req);
                
            string msg;
            var timeout = new System.TimeSpan(0, 0, 1); //1sec

            int nCount = 0;
            bool init = false;

            while (stop_thread_ == false)
            {
                if (req.TryReceiveFrameString(timeout, out msg))
                {
                    using (Stream s = GenerateStreamFromString(msg))
                    {

                        ProjectA.OneMessage receivedMSG = ProtoBuf.Serializer.Deserialize<ProjectA.OneMessage>(s);
                        PacketProcess(receivedMSG, req);
                        SendSyncReq(req);
                        //SendLoginPacket(req);
                    }
                }
                Thread.Sleep(500);
            }

            req.Close();
        }            
             
    }

    void Update()
    {
        /// Do normal Unity stuff
    }

    void OnApplicationQuit()
    {
        
        lock (thisLock_) stop_thread_ = true;
        client_thread_.Join();
        Debug.Log("Quit the thread.");
    }

}