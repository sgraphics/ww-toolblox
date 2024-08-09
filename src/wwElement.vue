<template>
    <span style="width:200px;height:300px">&nbsp;&nbsp;</span>
</template>

<script>
window.web3Initialized = false;
/* wwEditor:start */
// if (window.Web3AuthNoModal == null || window.Web3AuthNoModal == undefined) {
//   (async () => {
//     try {
//       const { Web3AuthNoModal } = await import('@web3auth/no-modal');
//       const { EthereumPrivateKeyProvider } = await import('@web3auth/ethereum-provider');
//       const { OpenloginAdapter } = await import('@web3auth/openlogin-adapter');
//       const { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } = await import('@web3auth/base');

//       window.Web3AuthNoModal = Web3AuthNoModal;
//       window.EthereumPrivateKeyProvider = EthereumPrivateKeyProvider;
//       window.CHAIN_NAMESPACES = CHAIN_NAMESPACES;
//       window.WEB3AUTH_NETWORK = WEB3AUTH_NETWORK;
//       window.OpenloginAdapter = OpenloginAdapter;
//     } catch (err) {
//       //console.error('Failed to load Web3Auth modules', err);
//     }
//   })();
// }

//window.initComplete = Promise.resolve();
/* wwEditor:end */

const TEXT_ALIGN_TO_JUSTIFY = {
    center: 'center',
    right: 'flex-end',
    left: 'flex-start',
    justify: 'center',
};
export default {
    props: {
        content: { type: Object, required: true },
        wwFrontState: { type: Object, required: true },
        wwElementState: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: [
        'update:content',
        'update:content:effect',
        'change-menu-visibility',
        'change-borders-style',
        'add-state',
        'remove-state',
        'trigger-event'
    ],
    setup() {
        function getQueryParams(url) {
            let params = {};
            let parser = document.createElement('a');
            parser.href = url;
            let query = parser.search.substring(1);
            let vars = query.split('&');
            for (let i = 0; i < vars.length; i++) {
                let pair = vars[i].split('=');
                params[pair[0]] = decodeURIComponent(pair[1]);
            }
            return params;
        }
        const fetchJWTFromXano = async (oauthToken, oauthVerifier) => {
            const response = await fetch(this.content.xanoApi + '/oauth/twitter/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    oauth_token: oauthToken,
                    oauth_verifier: oauthVerifier
                })
            });
            const data = await response.json();
            //alert(JSON.stringify(data));
            return data.authToken; // Assuming the JWT is in the `token` field
        };

        // Define the function to authenticate with Web3Auth
        const authenticateWithWeb3Auth = async (web3auth, jwt) => {
            try {
                await web3auth.logout();
                console.log('Successfully logged out');
            } catch (error) {
                console.error('Logout failed:', error);
            }

            await web3auth.connectTo("openlogin", {
                loginProvider: "jwt",
                extraLoginOptions: {
                    id_token: jwt,
                    verifierIdField: "sub",
                    domain: "https://your-domain.com", // Your domain if required
                },
            });

            return web3auth;
        };
        // Define the function to authenticate with Web3Auth
        const initWeb3Auth = async () => {
            const chainConfig = {
                chainNamespace: window.CHAIN_NAMESPACES.EIP155,
                chainId: "0x1",
                displayName: "Ethereum Mainnet",
                rpcTarget: "https://rpc.ankr.com/eth",
                blockExplorerUrl: "https://etherscan.io",
                ticker: "ETH",
                tickerName: "Ethereum",
                logo: "https://web3auth.io/images/web3authlog.png",
            };

            const privateKeyProvider = new window.EthereumPrivateKeyProvider({
                config: { chainConfig },
            });
            var clientId = "BCD3bVaYA3ZHu3F0bEs6eEyk3OzC1zZvTwkFkFQsiicid-7H4bxyQgBlC9IxCipUYlEbQ1P6ZqBzuDBAMx7svIA";

            const web3AuthOptions = {
                clientId,
                web3AuthNetwork: window.WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
                privateKeyProvider,
            };

            const web3auth = new window.Web3AuthNoModal(web3AuthOptions);

            const openloginAdapter = new window.OpenloginAdapter({
                adapterSettings: {
                    clientId: clientId, // Replace with your Web3Auth client ID
                    network: "sapphire_devnet", // Ensure this matches your network
                    uxMode: "redirect",
                    redirectUrl: window.location.href,
                    loginConfig: {
                        jwt: {
                            name: "Twitter Login", // Display name
                            verifier: "rddtor-verifier",
                            verifierSubIdentifier: "xano-twitter-rddtor-verifier",
                            typeOfLogin: "jwt",
                            clientId: clientId,
                        },
                    },
                },
            });

            web3auth.configureAdapter(openloginAdapter);
            
            await web3auth.init();

            return web3auth;
        };

        // Define the function to send the Web3Auth token to Xano
        const sendWeb3AuthTokenToXano = async (web3auth) => {
            const authenticationResult = await web3auth.authenticateUser();
            
            const web3authToken = authenticationResult.idToken;
            const response = await fetch(this.content.xanoApi + '/oauth/web3auth/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: web3authToken
                })
            });
            const data = await response.json();
            var authToken = data.authToken;
            this.$emit('trigger-event', { name: 'authenticated', event: { value: authToken } });
            /*
            //another way to get the wallet:
            var userId = data.user_id;
            var wallet = data.wallet;
            var signer = await (new window.ethers.BrowserProvider(web3auth.walletAdapters.openlogin.privateKeyProvider)).getSigner();
            wallet = await signer.getAddress();
            */
            return data;
        };

        // Main async function to handle the login process
        const handleLogin = async (oauthToken, oauthVerifier) => {
            await window.initComplete;
            const web3auth = await initWeb3Auth();
            if (web3auth.connected)
            {
                try {
                    const result = await sendWeb3AuthTokenToXano(web3auth);
                    console.log("Login successful:", result);
                } catch (error) {
                    console.error("Login failed:", error);
                }
            }
            else if (oauthToken && oauthVerifier){                
                try {
                    const jwt = await fetchJWTFromXano(oauthToken, oauthVerifier);
                    await authenticateWithWeb3Auth(web3auth, jwt);
                } catch (error) {
                    console.error("Starting login failed:", error);
                }
            }
        };

        // Get query parameters
        let queryParams = getQueryParams(window.location.href);
        let oauthToken = queryParams['oauth_token'];
        let oauthVerifier = queryParams['oauth_verifier'];

        // Perform actions if both oauth_token and oauth_verifier are set
        if (oauthToken && oauthVerifier) {
            function removeUrlParameters(url, parameters) {
                let urlObj = new URL(url);
                parameters.forEach(param => urlObj.searchParams.delete(param));
                return urlObj.toString();
            }
            // Get the current URL
            const currentUrl = window.location.href;
            // Parameters to remove
            const paramsToRemove = ['oauth_token', 'oauth_verifier'];
            // Get the new URL without the specified parameters
            const newUrl = removeUrlParameters(currentUrl, paramsToRemove);
            // Replace the current history state with the new URL
            window.history.replaceState({}, document.title, newUrl);
        }
        if (window.web3Initialized == false)
        {
            window.web3Initialized = true;
            handleLogin(oauthToken, oauthVerifier);
        }

        /* wwEditor:start */
        const { createElement } = wwLib.useCreateElement();
        /* wwEditor:end */

        return {
            /* wwEditor:start */
            createElement,
            /* wwEditor:end */
        };
    },
    data() {
        return {
            isReallyFocused: false,
        };
    },
    computed: {
        buttonStyle() {
            return {
                justifyContent: TEXT_ALIGN_TO_JUSTIFY[this.content['_ww-text_textAlign']] || 'center',
            };
        },
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        tag() {
            if (this.isEditing) return 'div';
            if (
                this.content.buttonType === 'submit' ||
                this.content.buttonType === 'reset' ||
                this.content.buttonType === 'button'
            )
                return 'button';
            return 'div';
        },
        buttonType() {
            if (this.isEditing) return '';
            if (
                this.content.buttonType === 'submit' ||
                this.content.buttonType === 'reset' ||
                this.content.buttonType === 'button'
            )
                return this.content.buttonType;
            return '';
        },
        text() {
            return this.wwElementState.props.text;
        },
        isFocused() {
            /* wwEditor:start */
            if (this.wwEditorState.isSelected) {
                return this.wwElementState.states.includes('focus');
            }
            /* wwEditor:end */
            return this.isReallyFocused;
        },
    },
    watch: {
        /* wwEditor:start */
        'content.hasRightIcon': {
            async handler(hasRightIcon) {
                if (this.wwEditorState.isACopy) {
                    return;
                }
                if (hasRightIcon && !this.content.rightIcon) {
                    const content = await this.createElement('ww-icon');
                    this.$emit('update:content:effect', { rightIcon: content });
                }
            },
        },
        'content.hasLeftIcon': {
            async handler(hasLeftIcon) {
                if (this.wwEditorState.isACopy) {
                    return;
                }
                if (hasLeftIcon && !this.content.leftIcon) {
                    const content = await this.createElement('ww-icon');
                    this.$emit('update:content:effect', { leftIcon: content });
                }
            },
        },
        /* wwEditor:end */
        'content.disabled': {
            immediate: true,
            handler(value) {
                if (value) {
                    this.$emit('add-state', 'disabled');
                } else {
                    this.$emit('remove-state', 'disabled');
                }
            },
        },
        isReallyFocused(isFocused, wasFocused) {
            if (isFocused && !wasFocused) {
                this.$emit('trigger-event', { name: 'focus' });
            } else if (!isFocused && wasFocused) {
                this.$emit('trigger-event', { name: 'blur' });
            }
        },
        isFocused: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.$emit('add-state', 'focus');
                } else {
                    this.$emit('remove-state', 'focus');
                }
            },
        },
    },
    methods: {
        /* wwEditor:start */
        selectParentFormContainer() {
            const parentUid = wwLib.selectParentByFlag(this.$el, 'form-container');
            if (!parentUid) {
                wwLib.wwNotification.open({
                    text: {
                        en: 'No parent form container found. Please, add this submit button into a form container.',
                        fr: 'Aucun formulaire parent trouvé. Veuillez intégrer ce bouton submit dans un form container.',
                    },
                    color: 'yellow',
                    duration: 6000,
                });
            }
        },
        /* wwEditor:end */
        xLogin() {
            
            const fetchRequestUrlFromXano = async () => {
                const response = await fetch(this.content.xanoApi + '/oauth/twitter/request_token?redirect_uri=' + window.location.href, {
                    method: 'GET'
                });
                const data = await response.json();
                
                return data.authUrl;
            };

            const startXLogin = async () => {
                try {
                    
                    const authUrl = await fetchRequestUrlFromXano();
                    
                    window.location.href = authUrl;
                } catch (error) {
                    console.error("Login failed:", error);
                }
            };
            startXLogin();
        },
        onBlur() {
            this.isReallyFocused = false;
        },
    },
};
</script>

<style lang="scss" scoped>
</style>
