import { Address, toNano } from '@ton/core';
import { NftCollection } from '../wrappers/UsualNftCollection';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { NftItem } from '../wrappers/UsualNftItem';

function hexToString(hex: string): string {
    // Remove any '0x' prefix if it exists
    if (hex.startsWith('0x')) {
        hex = hex.slice(2);
    }

    // Convert hex to string
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const hexCode = hex.substring(i, i + 2);
        str += String.fromCharCode(parseInt(hexCode, 16));
    }
    return str;
}

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('SimpleNft collection address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const simpleNftCollection = provider.open(NftCollection.fromAddress(address));

    const dataInfo = await simpleNftCollection.getGetCollectionData();
    let nftAddress = await simpleNftCollection.getGetNftAddressByIndex(0n);
    console.log("Found address: ", nftAddress);

    /* await simpleNftCollection.send(
        provider.sender(),
        {
            value: toNano('1.5'),
        },
        "Mint"
    ); */
    
    if (nftAddress) {
        const simpleNftITem = provider.open(NftItem.fromAddress(nftAddress));
        const nftData = await simpleNftITem.getGetNftData();
        console.log("Individual data: ", nftData);
        console.log("Decrypted nft: ", hexToString(String(nftData.individual_content)));
        console.log("Decrypted collection: ", hexToString(String(dataInfo.collection_content)));
    } else {
        console.log("Where is address?");
    }

    let dataInfoAfter = await simpleNftCollection.getGetCollectionData();
    let attempt = 1;

    console.log("Changes: ", dataInfo, dataInfoAfter)

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
