import "@stdlib/deploy";
import "./simple_nft_collection";

message TransferOwner {
    new_owner: Address;
}

message Withdraw {
    to: Address;
}

struct MasterData {
    master: Address;
    next_collection_index: Int;
    collection_creation_price: Int;
}

const masterMinStorage: Int = ton("0.1");

contract SimpleNftMaster with Deployable {
    
    owner: Address;
    next_collection_index: Int = 0;
    collection_creation_price: Int as uint32 = 0;

    init(
        owner: Address,
        creation_price: Int,
    ) {
        self.owner = owner;
        self.collection_creation_price = creation_price;
    }

    receive(msg: CollectionMintParams) {
        require(self.next_collection_index >= 0, "non-sequential Collections");
        let ctx: Context = context();
        require(ctx.value >= self.collection_creation_price, "Creation underpriced");
        let collection_init: StateInit = self.getCollectionItemInit(self.next_collection_index);

        send(SendParameters{
                to: contractAddress(collection_init), 
                value: masterMinStorage, 
                bounce: true,
                mode: SendIgnoreErrors,
                body: CollectionSetupParams {
                    owner_address: msg.owner_address,
                    master_address: self.owner,
                    collection_content: msg.collection_content,
                    nft_individual_content_url: msg.nft_individual_content_url,
                    royalty_params: msg.royalty_params,
                    mint_limit: msg.mint_limit,
                    nft_price: msg.nft_price
                }.toCell(),
                code: collection_init.code,
                data: collection_init.data
            });
        self.next_collection_index = self.next_collection_index + 1;
    }

    receive(msg: Withdraw) {
        require(sender() == self.owner, "Not from owner");
        send(SendParameters{
            to: msg.to,
            value: myBalance() - masterMinStorage,
            bounce: false,
            mode: SendIgnoreErrors
        });
    }

    receive(msg: TransferOwner) {
        require(sender() == self.owner, "Not from owner");
        self.owner = msg.new_owner;
    }

    get fun getCollectionItemInit(item_index: Int): StateInit {
        return initOf SimpleNftCollection(myAddress(), item_index);
    }

    get fun get_master_data (): MasterData {
        return MasterData{
            master: self.owner,
            next_collection_index: self.next_collection_index,
            collection_creation_price: self.collection_creation_price
        }
    }

    get fun get_collection_address_by_index (collection_index: Int): Address? {
        let initCode: StateInit = self.getCollectionItemInit(collection_index);
        return contractAddress(initCode);
    }

    get fun get_next_collection_index (): Int {
        return self.next_collection_index;
    }

}
