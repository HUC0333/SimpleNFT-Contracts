import "@stdlib/deploy";
import "@stdlib/ownable";
import "./simple_n_f_t_collection.tact";
import "./messages/structs.tact";
import "./messages/master.tact";
import "./messages/nft.tact";


contract SimpleNFTMaster with Deployable, Ownable {
    // Empty init() function is present by default in all Tact contracts
    // since v1.3.0, so the following may be omitted:
    //
    owner: Address;
    next_collection_index: Int as uint32 = 0;
    const minTonForStorage: Int = ton("0.03");
    const gasConsumption: Int = ton("0.03");
    const collectionCreationValue: Int = ton("1.5");

    init() {
        self.owner = sender();
    }

    receive(msg: CollectionMintMsg){
        self.mint(
           sender(), 
           msg.itemPrice, 
           msg.mintLimit, 
           msg.saleable,
           msg.editable,
           msg.title,
           msg.image,
           msg.metadata
           );
    }

    receive(msg: TransferOwner){
        self.requireOwner();
        self.owner = msg.new_owner;
    }

    receive("deposit") {

    }

    receive("withdraw") {
        self.requireOwner();
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: myBalance() - self.minTonForStorage,
            mode: SendIgnoreErrors
        })
    }

    fun mint(
        owner: Address, 
        itemPrice: Int,
        mintLimit: Int,
        saleable: Bool,
        editable: Bool,
        title: String,
        image: String,
        metadata: String ) {
        let msgValue: Int = context().value;
        require(context().value >= self.collectionCreationValue, "Collection mint underpriced");
        require(self.next_collection_index >= 0, "non-sequential Collections");
        let collection_init: StateInit = self.getNftCollectionInit(
            self.owner, 
            self.next_collection_index,
            owner, 
            itemPrice,
            mintLimit,
            saleable,
            editable,
            title,
            image,
            metadata
            );
        let collectionStartFee = msgValue - (ton("0.9") + self.minTonForStorage);

        send(SendParameters{
            to: contractAddress(collection_init),
            value: collectionStartFee,
            mode: SendIgnoreErrors,
            bounce: false,
            body: Transfer{
                query_id: 0,
                new_owner: self.owner
            }.toCell(),
            code: collection_init.code,
            data: collection_init.data
        });
        self.next_collection_index = self.next_collection_index + 1;
    }

    get fun getNftCollectionInit(
        master: Address, 
        collection_index: Int, 
        owner: Address,
        itemPrice: Int,
        mintLimit: Int,
        saleable: Bool,
        editable: Bool,
        title: String,
        image: String,
        metadata: String ): StateInit {

        return initOf SimpleNFTCollection(
        master, 
        collection_index,
        owner, 
        itemPrice,
        mintLimit,
        saleable,
        editable,
        title,
        image,
        metadata );
    }

    get fun get_creation_cost (): Int {
        return self.collectionCreationValue;
    }

    get fun get_collection_address (
        collection_index: Int, 
        owner: Address,
        itemPrice: Int,
        mintLimit: Int,
        saleable: Bool,
        editable: Bool,
        title: String,
        image: String,
        metadata: String): Address {
        let initCode: StateInit = self.getNftCollectionInit(
            self.owner, 
            collection_index, 
            owner,
            itemPrice,
            mintLimit,
            saleable,
            editable,
            title,
            image,
            metadata
            );
        return contractAddress(initCode);
    }

    get fun balance(): String {
        return myBalance().toCoinsString();
    }
}
