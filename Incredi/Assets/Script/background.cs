using UnityEngine;
using System.Threading;
using System.Collections;
using System.Timers;
using NetMQ; // for NetMQConfig
using NetMQ.Sockets;
using NetMQ.Monitoring;

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


public class background : MonoBehaviour
{
    Thread client_thread_;
    private Object thisLock_ = new Object();
    bool stop_thread_ = false;
    public Position pos;
    bool m_send;
    IProtocol m_pk;

    void Start()
    {
        //using (var requestSocket = new RequestSocket())

        m_send = true;
        Debug.Log("Start a request thread.");
        client_thread_ = new Thread(NetMQClient);
        client_thread_.Start();
    }
    
    public void Add()
    {
       // switch(objType)
        {
          //  case Protocol_Type.Respwan:
                PacketRespwan pk = new PacketRespwan();
                m_pk = pk;
                m_send = true;
             //   break;
        }
    }

    // Client thread which does not block Update()
    void NetMQClient()
    {
        AsyncIO.ForceDotNet.Force();
        using (var context = NetMQContext.Create())
        using (var res = context.CreateResponseSocket())
        using (var req = context.CreateRequestSocket())
        {
            // bind the server to a local tcp address
           // server.Bind("tcp://localhost:4231");

            // connect the client to the server
            req.Connect("tcp://127.0.0.1:5433");
            
            // send a message from the req socket
            
            string msg;
            var timeout = new System.TimeSpan(0, 0, 1); //1sec
            req.Send("aaaaa");
            bool is_connected = req.TryReceiveFrameString(timeout, out msg);
            
            while ( stop_thread_ == false)
            {
                req.Send("aaaaa");
                Debug.Log("Request a message.");
                /*if(m_send)
                {
                    string json = JsonUtility.ToJson(m_pk);
                    req.Send(json);
                    m_send = false;
                }*/

                req.TryReceiveFrameString(timeout, out msg);
                
                pos = Position.CreateFromJson(msg);
                Debug.Log(pos.x);
                Debug.Log(pos.y);

                Thread.Sleep(1/60);
            }


        }
        return;
            //NetMQConfig.ManualTerminationTakeOver();
            //NetMQConfig.ContextCreate(true);
            /*
            string msg;
        var timeout = new System.TimeSpan(0, 0, 1); //1sec

        Debug.Log("Connect to the server.");
        var requestSocket = new RequestSocket(">tcp://192.168.11.36:50020");
        requestSocket.SendFrame("SUB_PORT");
        bool is_connected = requestSocket.TryReceiveFrameString(timeout, out msg);

        while (is_connected && stop_thread_ == false)
        {
            Debug.Log("Request a message.");
            requestSocket.SendFrame("msg");
            is_connected = requestSocket.TryReceiveFrameString(timeout, out msg);
            Debug.Log("Sleep");
            Thread.Sleep(1000);
        }

        requestSocket.Close();
        Debug.Log("ContextTerminate.");*/
        //NetMQConfig.ContextTerminate();
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