using UnityEngine;
using System.Threading;
using System.Collections;
using System.Timers;
using NetMQ; // for NetMQConfig
using NetMQ.Sockets;
using NetMQ.Monitoring;
using System.IO;
using System.Collections.Generic;

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
    public ProjectA.GameUnit[] m_units;

    
    List<ProjectA.OneMessage> m_msgList;

    STATUS m_State = STATUS.E_LOGIN_REQUIED;

    void Start()
    {
        //using (var requestSocket = new RequestSocket())
        m_msgList = new List<ProjectA.OneMessage>();
        m_send = true;
        Debug.Log("Start a request thread.");
        client_thread_ = new Thread(NetMQClient);
        client_thread_.Start();
        m_id = "aaaa";


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

    public Stream GenerateStreamFromBuffer(byte [] s)
    {
        MemoryStream stream = new MemoryStream();
        stream.Write(s, 0, s.Length);
        stream.Position = 0;
        return stream;
    }

    public void SendSyncReq(RequestSocket req)
    {
        ProjectA.OneMessage syncMsg = new ProjectA.OneMessage();
        syncMsg.pType = ProjectA.OneMessage.ProtocolType.SYNCREQ;
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

    public void SendRespawn()
    {
        ProjectA.OneMessage oneMsg = new ProjectA.OneMessage();
        oneMsg.pType = ProjectA.OneMessage.ProtocolType.RESPWANREQ;
        oneMsg.respawnReq = new ProjectA.RespawnReq();
        oneMsg.respawnReq.key = m_key;
        oneMsg.respawnReq.x = 0;
        oneMsg.respawnReq.y = 50;
        m_msgList.Add(oneMsg);
        /*
        using (MemoryStream mem = new MemoryStream())
        {
            ProtoBuf.Serializer.Serialize<ProjectA.OneMessage>(mem, oneMsg);
            m_req.Send(mem.ToArray());
        }*/
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
            case ProjectA.OneMessage.ProtocolType.SYNCRES:
                {
                    m_units = receivedMSG.syncRes.units.ToArray();
                    foreach(ProjectA.GameUnit unitInfo in receivedMSG.syncRes.units)
                    {
                        
                    }
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
        using (var req = context.CreateRequestSocket())
        {

            // bind the server to a local tcp address
            // server.Bind("tcp://localhost:4231");

            // connect the client to the server
            req.Connect("tcp://192.168.0.4:5433");
            Thread.Sleep(500);

            SendLoginPacket(req);
                
            
            var timeout = new System.TimeSpan(0, 0, 1); //1sec

            int nCount = 0;
            bool init = false;

            while (stop_thread_ == false)
            {
                //string msg;
                byte[] msg;
                bool bMore;
                if (req.TryReceiveFrameBytes(timeout, out msg, out bMore))
                {
                        using (Stream s = GenerateStreamFromBuffer(msg))
                        {

                            ProjectA.OneMessage receivedMSG = ProtoBuf.Serializer.Deserialize<ProjectA.OneMessage>(s);
                            PacketProcess(receivedMSG, req);
                            if (m_msgList.Count == 0)
                                SendSyncReq(req);
                       
                        }
                    
                    
                    
                }
                if (m_msgList.Count == 0)
                    Thread.Sleep(50);
                else
                {
                    using (MemoryStream mem = new MemoryStream())
                    {
                        ProtoBuf.Serializer.Serialize<ProjectA.OneMessage>(mem, m_msgList[0]);
                        req.Send(mem.ToArray());
                    }
                    m_msgList.Clear();
                }
            }

            
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