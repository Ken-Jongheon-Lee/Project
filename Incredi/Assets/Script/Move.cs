using UnityEngine;
using System.Collections;

public class Move : MonoBehaviour {

    public int index;

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
    }
}
