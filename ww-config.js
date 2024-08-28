export default {
    inherit: 'ww-text',
    options: {
        autoByContent: true,
    },
    editor: {
        label: {
            en: 'Toolblox',
        },
        icon: 'cursor-click',
    },
    states: [],
    actions: [
        { label: 'Start X login', action: 'xLogin' },
        { label: 'Start Metamask login', action: 'metamaskLogin' },
        { label: 'Start wallet login', action: 'walletLogin' },
        { label: 'Logout', action: 'logout' },
        { label: 'Start Google login', action: 'googleLogin' },
        { label: 'Start Coinbase login', action: 'coinbaseLogin' },
        { label: 'Signature test', action: 'signatureTest' },
    ],
    triggerEvents: [
        { name: 'authenticated', label: { en: 'On authenticated' }, event: { value: '' } },
        { name: 'notBusy', label: { en: 'On not busy' } },
        { name: 'isBusy', label: { en: 'On is busy' }, event: { value: '' } },
    ],
    properties: {
        xanoXEndpoint:
        {
            label: { en: 'XANO X URL' },
            type: 'Text',
            section: 'settings',
            bindable: false,
            options: {
                placeholder: 'Base url for XANO X oauth APIs. E.g. "https://xsrr-l2ye-dpbj.f2.xano.io/api:NUVFj-l-"',
            },
            defaultValue: '',
        },
        xanoWeb3AuthEndpoint:
        {
            label: { en: 'XANO Web3Auth URL' },
            type: 'Text',
            section: 'settings',
            bindable: false,
            options: {
                placeholder: 'Base url for XANO Web3Auth APIs. E.g. "https://xsrr-l2ye-dpbj.f2.xano.io/api:NUVFj-l-"',
            },
            defaultValue: '',
        },
        googleEndpoint:
        {
            label: { en: 'XANO Google URL' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: false,
            options: {
                placeholder: 'Base url for XANO Google APIs. E.g. "https://xsrr-l2ye-dpbj.f2.xano.io/api:NUVFj-l-"',
            }
        },
        clientId:
        {
            label: { en: 'Web3Auth Client Id' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: false,
            options: {
                placeholder: 'Web3Auth Client Id',
            }
        },
        walletConnectProjectId:
        {
            label: { en: 'Wallet Connect Project Id' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: false,
            options: {
                placeholder: 'Wallet Connect Project Id',
            }
        },
        coinbaseProjectId:
        {
            label: { en: 'Coinbase Project Id' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: false,
            options: {
                placeholder: 'Coinbase Project Id',
            }
        },
        redirectUri:
        {
            label: { en: 'Redirect URI' },
            type: 'Text',
            section: 'settings',
            defaultValue: '',
            bindable: false,
            options: {
                placeholder: 'Redirect URI',
            }
        }
    },
};
