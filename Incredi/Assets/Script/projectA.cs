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
  [global::System.Serializable, global::ProtoBuf.ProtoContract(Name=@"Respawn")]
  public partial class Respawn : global::ProtoBuf.IExtensible
  {
    public Respawn() {}
    
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
    private global::ProtoBuf.IExtension extensionObject;
    global::ProtoBuf.IExtension global::ProtoBuf.IExtensible.GetExtensionObject(bool createIfMissing)
      { return global::ProtoBuf.Extensible.GetExtensionObject(ref extensionObject, createIfMissing); }
  }
  
}