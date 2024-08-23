import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/text_reader.tact',
    options: {
        debug: true,
    },
};
