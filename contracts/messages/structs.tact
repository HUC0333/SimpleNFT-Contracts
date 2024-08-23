struct NftCollectionData {
    owner: Address;
    itemPrice: Int;
    mintLimit: Int;
    saleable: Bool;
    editable: Bool;
    title: String;
    image: String;
    metadata: String;
}

struct NftCollectionDataWithIndex {
    collection_index: Int;
    owner: Address;
    itemPrice: Int;
    mintLimit: Int;
    saleable: Bool;
    editable: Bool;
    title: String;
    image: String;
    metadata: String;
}

struct NftItemData {
    owner: Address;
    collection_address: Address;
    item_index: Int;
    individual_content: Cell;
}

message TransferOwner {
    new_owner: Address;
}

message Withdraw {
    address: Address;
}
