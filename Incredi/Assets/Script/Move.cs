using UnityEngine;
using System.Collections;

public class Move : MonoBehaviour {

    public int index;

    public float m_lastRot;
    public float m_newRot;
    public Vector2 m_lastPos;
    public Vector2 m_newPos;
    public float LastReceive;
    public float LastReceieveDelta;
    // Use this for initialization
    void Start () {
        transform.position = new Vector2(0, 50);
    }
	
	// Update is called once per frame
	void Update () {
        
        transform.position = Vector2.Lerp(m_lastPos, m_newPos,(Time.time - LastReceive)/ LastReceieveDelta);
        //transform.rotation = Quaternion.Lerp(Quaternion.EulerAngles(Vector3.forward * (m_lastRot* Mathf.Rad2Deg)), 
        //  Quaternion.EulerAngles(Vector3.forward * (m_newRot * Mathf.Rad2Deg)), (Time.time - LastReceive) / LastReceieveDelta);
        transform.rotation = Quaternion.EulerAngles(Vector3.forward * (m_newRot * Mathf.Rad2Deg));
    }
}
