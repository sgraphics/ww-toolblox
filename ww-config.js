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
    states: ['focus', 'disabled'],
    actions: [
        { label: 'Start X login', action: 'xLogin' },
        { label: 'Start Metamask login', action: 'metamaskLogin' },
        { label: 'Start wallet login', action: 'walletLogin' },
        { label: 'Logout', action: 'logout' },
        { label: 'Start Google login', action: 'googleLogin' },
    ],
    triggerEvents: [
        { name: 'focus', label: { en: 'On focus' }, event: null },
        { name: 'authenticated', label: { en: 'On authenticated' }, event: { value: '' } },
        { name: 'blur', label: { en: 'On blur' }, event: null },
    ],
    properties: {
        xanoXEndpoint:
        {
            label: { en: 'XANO X URL' },
            type: 'Text',
            section: 'settings',
            defaultValue: false,
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
            defaultValue: false,
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
            defaultValue: false,
            bindable: false,
            options: {
                placeholder: 'Base url for XANO Google APIs. E.g. "https://xsrr-l2ye-dpbj.f2.xano.io/api:NUVFj-l-"',
            },
            defaultValue: '',
        },
        clientId:
        {
            label: { en: 'Web3Auth Client Id' },
            type: 'Text',
            section: 'settings',
            defaultValue: false,
            bindable: false,
            options: {
                placeholder: 'Web3Auth Client Id',
            },
            defaultValue: '',
        },
    },
};
