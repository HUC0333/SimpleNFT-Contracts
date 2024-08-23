import "@stdlib/deploy";
import "@stdlib/ownable";
import "./simple_n_f_t_item.tact";
import "./messages/nft.tact";
import "./messages/structs.tact";

contract SimpleNFTCollection with Deployable, Ownable {
         const minTonForStorage: Int = ton("0.03");
    const gasConsumption: Int = ton("0.03");

    owner: Address;
    master: Address;
    itemPrice: Int as uint32;
    next_item_index: Int as uint32 = 0;
    collection_index: Int as uint32 = 0;
    mintLimit: Int;
    saleable: Bool;
    editable: Bool;
    title: String;
    image: String;
    metadata: String;

    init( master: Address, 
          collection_index: Int,     
          owner: Address,
          itemPrice: Int,
          mintLimit: Int,
          saleable: Bool,
          editable: Bool,
          title: String,
          image: String,
          metadata: String ) {
        self.master = master;
        self.owner = owner;
        self.collection_index = collection_index;
        self.itemPrice = itemPrice;
        self.mintLimit = mintLimit;
        self.saleable = saleable;
        self.editable = editable;
        self.title = title;
        self.image = image;
        self.metadata = metadata;
    }

    receive("Mint"){
        self.requireOwner();
        self.mint(sender());
    }

    fun mint(receiver: Address) {
        require(self.next_item_index >= 0, "non-sequential NFTs");
        require(self.mintLimit == 0 || self.next_item_index <= self.mintLimit, "Mint limit reached");
        require(context().value >= self.itemPrice, "NFT creation underpriced");
        let nft_init: StateInit = self.getNftItemInit(self.next_item_index);
        let msgValue: Int = context().value;
        let tonBalanceBeforeMsg: Int = myBalance() - msgValue;
        let storageFee: Int = self.minTonForStorage - min(tonBalanceBeforeMsg, self.minTonForStorage);
        msgValue = msgValue - (storageFee + self.gasConsumption);

        let masterFee = (msgValue * 9) / 100;
        let collectionOwnerFee = ((msgValue * 91) / 100) - (storageFee + self.gasConsumption + self.minTonForStorage);

        send(SendParameters{
            to: self.master,
            value: masterFee
        });

        send(SendParameters{
            to: self.master,
            value: collectionOwnerFee
        });

        send(SendParameters{
            to: contractAddress(nft_init),
            value: self.minTonForStorage,
            mode: SendIgnoreErrors,
            bounce: false,
            body: Transfer{
                query_id: 0,
                new_owner: receiver
            }.toCell(),
            code: nft_init.code,
            data: nft_init.data
        });
        self.next_item_index = self.next_item_index + 1;

    }

    get fun getNftItemInit(item_index: Int): StateInit {
        let b: StringBuilder = beginString();
        b.append("Item # - ");
        b.append(item_index.toString());

        return initOf SimpleNFTItem(sender(), myAddress(), item_index, b.toString(), self.saleable);
    }

    get fun get_nft_address_by_index(item_index: Int): Address {
        let initCode: StateInit = self.getNftItemInit(item_index);
        return contractAddress(initCode);
    }

    get fun get_collection_data(): NftCollectionDataWithIndex {
        return NftCollectionDataWithIndex {
            owner: self.owner,
            collection_index: self.collection_index,
            itemPrice: self.itemPrice,
            mintLimit: self.mintLimit,
            saleable: self.saleable,
            editable: self.editable,
            title: self.title,
            image: self.image,
            metadata: self.metadata
        };
    }
}
