using UnityEngine;
using System.Collections;

public class Move : MonoBehaviour {

    public Camera cam;
	// Use this for initialization
	void Start () {
        
        

    }
	
	// Update is called once per frame
	void Update () {
        background bg = cam.GetComponent<background>();
        Vector2 v = new Vector2(bg.m_Position.x, bg.m_Position.y);
        transform.position = v;
        
    }
}
