//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

// Generated from: projectA.proto
namespace ProjectA
{
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"LoginReq")]
  public partial class LoginReq : global::ProtoBuf.IExtensible
  {
    public LoginReq() {}
    
    private string _id;
    [global::ProtoBuf.ProtoMember(1, IsRequired = true, Name=@"id", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string id
    {
      get { return _id; }
      set { _id = value; }
    }
    private string _pw;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"pw", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string pw
    {
      get { return _pw; }
      set { _pw = value; }
    }
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"LoginRes")]
  public partial class LoginRes : global::ProtoBuf.IExtensible
  {
    public LoginRes() {}
    
    private bool _bResult;
    [global::ProtoBuf.ProtoMember(1, IsRequired = true, Name=@"bResult", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public bool bResult
    {
      get { return _bResult; }
      set { _bResult = value; }
    }
    private string _key;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"key", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string key
    {
      get { return _key; }
      set { _key = value; }
    }
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"RespawnReq")]
  public partial class RespawnReq : global::ProtoBuf.IExtensible
  {
    public RespawnReq() {}
    
    private float _x;
    [global::ProtoBuf.ProtoMember(1, IsRequired = true, Name=@"x", DataFormat = global::ProtoBuf.DataFormat.FixedSize)]
    public float x
    {
      get { return _x; }
      set { _x = value; }
    }
    private float _y;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"y", DataFormat = global::ProtoBuf.DataFormat.FixedSize)]
    public float y
    {
      get { return _y; }
      set { _y = value; }
    }
    private int _unitType;
    [global::ProtoBuf.ProtoMember(3, IsRequired = true, Name=@"unitType", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int unitType
    {
      get { return _unitType; }
      set { _unitType = value; }
    }
    private string _key;
    [global::ProtoBuf.ProtoMember(4, IsRequired = true, Name=@"key", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string key
    {
      get { return _key; }
      set { _key = value; }
    }
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"RespawnRes")]
  public partial class RespawnRes : global::ProtoBuf.IExtensible
  {
    public RespawnRes() {}
    
    private bool _bResult;
    [global::ProtoBuf.ProtoMember(1, IsRequired = true, Name=@"bResult", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public bool bResult
    {
      get { return _bResult; }
      set { _bResult = value; }
    }
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"Position")]
  public partial class Position : global::ProtoBuf.IExtensible
  {
    public Position() {}
    
    private float _x;
    [global::ProtoBuf.ProtoMember(1, IsRequired = true, Name=@"x", DataFormat = global::ProtoBuf.DataFormat.FixedSize)]
    public float x
    {
      get { return _x; }
      set { _x = value; }
    }
    private float _y;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"y", DataFormat = global::ProtoBuf.DataFormat.FixedSize)]
    public float y
    {
      get { return _y; }
      set { _y = value; }
    }
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"GameUnit")]
  public partial class GameUnit : global::ProtoBuf.IExtensible
  {
    public GameUnit() {}
    
    private int _index;
    [global::ProtoBuf.ProtoMember(1, IsRequired = true, Name=@"index", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int index
    {
      get { return _index; }
      set { _index = value; }
    }
    private float _posX;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"posX", DataFormat = global::ProtoBuf.DataFormat.FixedSize)]
    public float posX
    {
      get { return _posX; }
      set { _posX = value; }
    }
    private float _posY;
    [global::ProtoBuf.ProtoMember(3, IsRequired = true, Name=@"posY", DataFormat = global::ProtoBuf.DataFormat.FixedSize)]
    public float posY
    {
      get { return _posY; }
      set { _posY = value; }
    }
    private float _angle;
    [global::ProtoBuf.ProtoMember(4, IsRequired = true, Name=@"angle", DataFormat = global::ProtoBuf.DataFormat.FixedSize)]
    public float angle
    {
      get { return _angle; }
      set { _angle = value; }
    }
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"SyncReq")]
  public partial class SyncReq : global::ProtoBuf.IExtensible
  {
    public SyncReq() {}
    
    private int _Count;
    [global::ProtoBuf.ProtoMember(1, IsRequired = true, Name=@"Count", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public int Count
    {
      get { return _Count; }
      set { _Count = value; }
    }
    private string _key;
    [global::ProtoBuf.ProtoMember(2, IsRequired = true, Name=@"key", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public string key
    {
      get { return _key; }
      set { _key = value; }
    }
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"SyncRes")]
  public partial class SyncRes : global::ProtoBuf.IExtensible
  {
    public SyncRes() {}
    
    private readonly global::System.Collections.Generic.List<ProjectA.GameUnit> _units = new global::System.Collections.Generic.List<ProjectA.GameUnit>();
    [global::ProtoBuf.ProtoMember(2, Name=@"units", DataFormat = global::ProtoBuf.DataFormat.Default)]
    public global::System.Collections.Generic.List<ProjectA.GameUnit> units
    {
      get { return _units; }
    }
  
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"OneMessage")]
  public partial class OneMessage : global::ProtoBuf.IExtensible
  {
    public OneMessage() {}
    
    private ProjectA.OneMessage.ProtocolType _pType;
    [global::ProtoBuf.ProtoMember(1, IsRequired = true, Name=@"pType", DataFormat = global::ProtoBuf.DataFormat.TwosComplement)]
    public ProjectA.OneMessage.ProtocolType pType
    {
      get { return _pType; }
      set { _pType = value; }
    }
    private ProjectA.LoginReq _loginReq = null;
    [global::ProtoBuf.ProtoMember(2, IsRequired = false, Name=@"loginReq", DataFormat = global::ProtoBuf.DataFormat.Default)]
    [global::System.ComponentModel.DefaultValue(null)]
    public ProjectA.LoginReq loginReq
    {
      get { return _loginReq; }
      set { _loginReq = value; }
    }
    private ProjectA.LoginRes _loginRes = null;
    [global::ProtoBuf.ProtoMember(3, IsRequired = false, Name=@"loginRes", DataFormat = global::ProtoBuf.DataFormat.Default)]
    [global::System.ComponentModel.DefaultValue(null)]
    public ProjectA.LoginRes loginRes
    {
      get { return _loginRes; }
      set { _loginRes = value; }
    }
    private ProjectA.RespawnReq _respawnReq = null;
    [global::ProtoBuf.ProtoMember(4, IsRequired = false, Name=@"respawnReq", DataFormat = global::ProtoBuf.DataFormat.Default)]
    [global::System.ComponentModel.DefaultValue(null)]
    public ProjectA.RespawnReq respawnReq
    {
      get { return _respawnReq; }
      set { _respawnReq = value; }
    }
    private ProjectA.RespawnRes _respawnRes = null;
    [global::ProtoBuf.ProtoMember(5, IsRequired = false, Name=@"respawnRes", DataFormat = global::ProtoBuf.DataFormat.Default)]
    [global::System.ComponentModel.DefaultValue(null)]
    public ProjectA.RespawnRes respawnRes
    {
      get { return _respawnRes; }
      set { _respawnRes = value; }
    }
    private ProjectA.SyncReq _syncReq = null;
    [global::ProtoBuf.ProtoMember(6, IsRequired = false, Name=@"syncReq", DataFormat = global::ProtoBuf.DataFormat.Default)]
    [global::System.ComponentModel.DefaultValue(null)]
    public ProjectA.SyncReq syncReq
    {
      get { return _syncReq; }
      set { _syncReq = value; }
    }
    private ProjectA.SyncRes _syncRes = null;
    [global::ProtoBuf.ProtoMember(7, IsRequired = false, Name=@"syncRes", DataFormat = global::ProtoBuf.DataFormat.Default)]
    [global::System.ComponentModel.DefaultValue(null)]
    public ProjectA.SyncRes syncRes
    {
      get { return _syncRes; }
      set { _syncRes = value; }
    }
    [global::ProtoBuf.ProtoContract(Name=@"ProtocolType")]
    public enum ProtocolType
    {
            
      [global::ProtoBuf.ProtoEnum(Name=@"LOGINREQ", Value=1)]
      LOGINREQ = 1,
            
      [global::ProtoBuf.ProtoEnum(Name=@"LOGINRES", Value=2)]
      LOGINRES = 2,
            
      [global::ProtoBuf.ProtoEnum(Name=@"RESPWANREQ", Value=3)]
      RESPWANREQ = 3,
            
      [global::ProtoBuf.ProtoEnum(Name=@"RESPWANRES", Value=4)]
      RESPWANRES = 4,
            
      [global::ProtoBuf.ProtoEnum(Name=@"SYNCREQ", Value=5)]
      SYNCREQ = 5,
            
      [global::ProtoBuf.ProtoEnum(Name=@"SYNCRES", Value=6)]
      SYNCRES = 6
    }
  
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
}