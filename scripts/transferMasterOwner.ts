import { Address, beginCell, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { SimpleNftMaster } from '../wrappers/SimpleNftMaster';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const contractAddress = await ui.input('Contract address:');
    const newOwner = await ui.input('New owner address:');

    const contract = provider.open(SimpleNftMaster.fromAddress(Address.parse(contractAddress)));

    await contract.send(
        provider.sender(),
        {
            value: toNano('0.6'),
        },
        {
            $$type: "TransferOwner",
            new_owner: Address.parse(newOwner)
        }
    );

    const newData = await contract.getGetMasterData();
    console.log("Updated data:", newData);
}