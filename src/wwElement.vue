<template>
    <span style="width:200px;height:300px">&nbsp;&nbsp;</span>
</template>

<script>
let web3authGlobal = {};
let authTokenGlobal = "";
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
        'add-state',
        'remove-state',
        'trigger-event'
    ],
    beforeMount() {
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
        const fetchXJwtFromXano = async (oauthToken, oauthVerifier) => {
            if (web3authGlobal?.connected == true)
            {
                //connect X to login
                const response = await fetch(this.content.xanoXEndpoint + '/oauth/twitter/connect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authTokenGlobal}`,
                    },
                    body: JSON.stringify({
                        oauth_token: oauthToken,
                        oauth_verifier: oauthVerifier
                    })
                });
                const data = await response.json();
                return data?.authToken; // Assuming the JWT is in the `token` field
            }else{      
                //login with X          
                const response = await fetch(this.content.xanoXEndpoint + '/oauth/twitter/access_token', {
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
                return data.authToken; // Assuming the JWT is in the `token` field
            }
        };
        const fetchGoogleJwtFromXano = async (googleCode) => {
            const response = await fetch(this.content.googleEndpoint + '/oauth/google/continue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: googleCode,
                    redirect_uri: window.location.href
                })
            });
            const data = await response.json();
            //alert(JSON.stringify(data));
            return data.authToken; // Assuming the JWT is in the `token` field
        };

        // Define the function to authenticate with Web3Auth
        const authenticateWithWeb3Auth = async (web3auth, jwt) => {
            if (!web3auth.connected)
            {
                await web3auth.connectTo("openlogin", {
                    loginProvider: "jwt",
                    extraLoginOptions: {
                        id_token: jwt,
                        verifierIdField: "sub",
                        domain: window.location.href,
                    },
                });
            }
            return web3auth;
        };
        
        // Define the function to authenticate with Web3Auth
        const initWeb3Auth = async () => {
            const chainConfig = {
                chainNamespace: window.CHAIN_NAMESPACES.EIP155,
                chainId: "0x2105",
                displayName: "Base Mainnet",
                rpcTarget: "https://mainnet.base.org",
                blockExplorerUrl: "https://base.blockscout.com",
                ticker: "ETH",
                tickerName: "Ethereum",
                logo: "https://github.com/base-org/brand-kit/raw/main/logo/in-product/Base_Network_Logo.svg",
            };

            const privateKeyProvider = new window.EthereumPrivateKeyProvider({
                config: { chainConfig },
            });
            var clientId = this.content.clientId;

            const web3AuthOptions = {
                clientId,
                web3AuthNetwork: window.WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
                privateKeyProvider,
            };

            const web3auth = new window.Web3AuthNoModal(web3AuthOptions);
            web3authGlobal = web3auth;
            const openloginAdapter = new window.OpenloginAdapter({
                adapterSettings: {
                    clientId: clientId,
                    network: "sapphire_devnet",
                    uxMode: "redirect",
                    redirectUrl: window.location.href,
                    loginConfig: {
                        jwt: {
                            name: "X Login",
                            verifier: "rddtor-verifier",
                            verifierSubIdentifier: "xano-twitter-rddtor-verifier",
                            typeOfLogin: "jwt",
                            clientId: clientId,
                        },
                        google: {
                            name: "Google Login",
                            verifier: "rddtor-verifier",
                            verifierSubIdentifier: "google-rddtor-verifier",
                            typeOfLogin: "google",
                            clientId: this.content.googleClientId,
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
            const response = await fetch(this.content.xanoWeb3AuthEndpoint + '/oauth/web3auth/authenticate', {
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
            authTokenGlobal = authToken;
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
        const handleLogin = async (oauthToken, oauthVerifier, googleCode) => {
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
            //Do NOT use "else if" here. Need to authenticate to be able to add login to existing user.
            if (oauthToken && oauthVerifier){                
                try {
                    const jwt = await fetchXJwtFromXano(oauthToken, oauthVerifier);
                    await authenticateWithWeb3Auth(web3auth, jwt);
                } catch (error) {
                    console.error("Starting login failed:", error);
                }
            }
            else if (googleCode){                
                try {
                    const jwt = await fetchGoogleJwtFromXano(googleCode);
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
        let code = queryParams['code'];

        // Perform actions if both oauth_token and oauth_verifier are set
        if (oauthToken || oauthVerifier || code) {
            function removeUrlParameters(url, parameters) {
                let urlObj = new URL(url);
                parameters.forEach(param => urlObj.searchParams.delete(param));
                return urlObj.toString();
            }
            // Get the current URL
            const currentUrl = window.location.href;
            // Parameters to remove
            const paramsToRemove = ['oauth_token', 'oauth_verifier', 'code', 'scope', 'authuser', 'prompt'];
            // Get the new URL without the specified parameters
            const newUrl = removeUrlParameters(currentUrl, paramsToRemove);
            // Replace the current history state with the new URL
            window.history.replaceState({}, document.title, newUrl);
        }
        if (window.web3Initialized == false)
        {
            window.web3Initialized = true;
            handleLogin(oauthToken, oauthVerifier, code);
        }

        // /* wwEditor:start */
        // const { createElement } = wwLib.useCreateElement();
        // /* wwEditor:end */

        // return {
        //     /* wwEditor:start */
        //     createElement,
        //     /* wwEditor:end */
        // };
    },
    data() {
        return {
            isReallyFocused: false,
        };
    },
    computed: {
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        tag() {
            return 'div';
        },
        isAuthenticated()
        {
            return web3authGlobal?.connected == true;
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
        logout() {
            (async function() {
                try {
                    await web3authGlobal.logout();
                    console.log('Successfully logged out');
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            })();
        },
        googleLogin()
        {
            const fetchRequestUrlFromXano = async () => {
                const response = await fetch(this.content.googleEndpoint + '/oauth/google/init?redirect_uri=' + window.location.href, {
                    method: 'GET'
                });
                const data = await response.json();                
                return data.authUrl;
            };
            const startGoogleLogin = async () => {
                try {
                    
                    const authUrl = await fetchRequestUrlFromXano();
                    
                    window.location.href = authUrl;
                } catch (error) {
                    console.error("Login failed:", error);
                }
            };
            startGoogleLogin();
        },
        xLogin() {
            const fetchRequestUrlFromXano = async () => {
                const response = await fetch(this.content.xanoXEndpoint + '/oauth/twitter/request_token?redirect_uri=' + window.location.href, {
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

<style scoped>
.ww-typeform-embed.ww-editing {
    pointer-events: none;
}
</style>
