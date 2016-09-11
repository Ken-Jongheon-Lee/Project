using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class GameObjMgr : MonoBehaviour {
    public GameObject socket;
    List <GameObject> m_units;
    public GameObject prefab;
	// Use this for initialization
	void Start () {
        //Instantiate()
        m_units = new List<GameObject>();
        Application.runInBackground = true;
    }
	
	// Update is called once per frame
	void Update () {
        background bg = socket.GetComponent<background>();
        if (null == bg.m_units)
            return;
        for (int i = 0;i <  bg.m_units.Length; ++i)
        {
            bool found = false;
            foreach(GameObject obj in m_units)
            {
                Move existObj = obj.GetComponent<Move>();
                if(existObj)
                {
                    if(bg.m_units[i].index == existObj.index)
                    {
                        //좌표 갱신
                        found = true;
                        existObj.m_lastPos = existObj.m_newPos;
                        existObj.m_newPos = new Vector2(bg.m_units[i].posX, bg.m_units[i].posY);
                        existObj.m_lastRot = existObj.m_newRot;
                        existObj.m_newRot = bg.m_units[i].angle;
                        existObj.LastReceieveDelta = Time.time - existObj.LastReceive;
                        existObj.LastReceive = Time.time;
                        

                    }
                    
                }                
            }

            if(!found)
            {
                GameObject go = Instantiate(prefab , new Vector3(bg.m_units[i].posX, bg.m_units[i].posY,0),Quaternion.identity) as GameObject;
                
                Move newMove = go.GetComponent<Move>();
                if(newMove)
                {
                    newMove.index = bg.m_units[i].index;
                    newMove.LastReceive = Time.time;
                    newMove.m_lastPos = new Vector2(bg.m_units[i].posX, bg.m_units[i].posY);
                    newMove.m_newPos= new Vector2(bg.m_units[i].posX, bg.m_units[i].posY);
                }
                m_units.Add(go);


            }
            
        }
        bg.m_units = null;
    }
    
}
