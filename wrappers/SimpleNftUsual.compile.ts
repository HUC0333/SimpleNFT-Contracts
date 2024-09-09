import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/simple_nft_usual.tact',
    options: {
        debug: true,
    },
};
