import "@stdlib/deploy";
import "@stdlib/ownable";
import "./messages/nft.tact";

contract SimpleNFTItem with Deployable, Ownable {

    owner: Address;
    collection_address: Address;
    item_index: Int;
    individual_content: String;
    saleable: Bool;

    init(
        owner: Address,
        collection_address: Address,
        item_index: Int,
        individual_content: String,
        saleable: Bool
    ) {
        self.owner = owner;
        self.collection_address = collection_address;
        self.item_index = item_index;
        self.individual_content = individual_content;
        self.saleable = saleable;
    }

    receive(msg: Transfer){
        require(self.saleable == true, "Token is not available to transfer");
        self.requireOwner();
        self.owner = msg.new_owner;
    }

    get fun get_item_data(): ItemData {
        return ItemData{
            owner: self.owner,
            collection_address: self.collection_address,
            item_index: self.item_index,
            individual_content: self.individual_content.asSlice().asCell()
        };
    }


}
