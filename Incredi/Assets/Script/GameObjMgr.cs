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
	}
	
	// Update is called once per frame
	void Update () {
        background bg = socket.GetComponent<background>();
        for(int i = 0;i <  bg.m_units.Length; ++i)
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
                        obj.transform.position = new Vector2(bg.m_units[i].posX, bg.m_units[i].posY);
                    }
                    
                }                
            }

            if(!found)
            {
                GameObject go = Instantiate(prefab) as GameObject;
                go.transform.position = new Vector2(bg.m_units[i].posX, bg.m_units[i].posY);
                Move newMove = go.GetComponent<Move>();
                if(newMove)
                {
                    newMove.index = bg.m_units[i].index;
                }
                m_units.Add(go);


            }
            
        }
	}
}
