export const URL = {
    PEERS: "http://%s/eapi/api/device/peers/",
    CONTEXT: "http://%s/eapi/api/sip/contextNewTelesale",
    PASSWORD: "http://%s/eapi/api/sip/getPasswordSip",
    CHANGE_PASSWORD: "http://%s/eapi/api/sip/changePasswordSip",
    CHANNEL: "http://%s/eapi/api/ami/channels",
    HANGUPSIP: "http://%s/eapi/api/ami/hangup",
    LISTENSPYSIP: "http://%s/eapi/api/ami/ListenSpy",
    PICKUPTHECALL: "http://%s/eapi/api/ami/pickup",
    TRANSFERTHECALL: "http://%s/eapi/api/ami/calltransfer",
    CHECK_TYPE_SIP: "http://%s/eapi/api/device/checkTypeSIP",
    DIAL_UP: "http://%s/eapi/api/ami/dialupTelesale",
    INFO_SIP: "http://%s/eapi/api/sip/getInfoSipForBussOmni",
};

export const QrCode = "%voip24h%QRcode";

export const REDIS_CONNECT_TIMEOUT = 10000;
export const REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: {
        vn: "Lỗi redis rồi",
        en: "Service connect error",
    },
};

export  const EXPIRATION_IN_SECOND = 3 * 24 * 60 * 60;

export const INSTANCE_KEY = {
    PRIMARY: "primary",
    SECONDARY: "secondary",
}
