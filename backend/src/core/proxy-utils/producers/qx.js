import { Result } from './utils';
const targetPlatform = 'QX';

export default function QX_Producer() {
    const produce = (proxy) => {
        switch (proxy.type) {
            case 'ss':
                return shadowsocks(proxy);
            case 'ssr':
                return shadowsocksr(proxy);
            case 'trojan':
                return trojan(proxy);
            case 'vmess':
                return vmess(proxy);
            case 'http':
                return http(proxy);
            case 'socks5':
                return socks5(proxy);
        }
        throw new Error(
            `Platform ${targetPlatform} does not support proxy type: ${proxy.type}`,
        );
    };
    return { produce };
}

function shadowsocks(proxy) {
    const result = new Result(proxy);
    const append = result.append.bind(result);
    const appendIfPresent = result.appendIfPresent.bind(result);

    append(`shadowsocks=${proxy.server}:${proxy.port}`);
    append(`,method=${proxy.cipher}`);
    append(`,password=${proxy.password}`);

    // obfs
    if (proxy.plugin) {
        if (proxy.plugin === 'obfs') {
            const opts = proxy['plugin-opts'];
            append(`,obfs=${opts.mode}`);
        } else if (
            proxy.plugin === 'v2ray-plugin' &&
            proxy['plugin-opts'].mode === 'websocket'
        ) {
            const opts = proxy['plugin-opts'];
            if (opts.tls) append(`,obfs=wss`);
            else append(`,obfs=ws`);
        }
        appendIfPresent(
            `,obfs-host=${proxy['plugin-opts'].host}`,
            'plugin-opts.host',
        );
        appendIfPresent(
            `,obfs-uri=${proxy['plugin-opts'].path}`,
            'plugin-opts.path',
        );
    }

    // tls verification
    appendIfPresent(
        `,tls-verification=${!proxy['skip-cert-verify']}`,
        'skip-cert-verify',
    );
    appendIfPresent(`,tls-host=${proxy.sni}`, 'sni');

    // tfo
    appendIfPresent(`,fast-open=${proxy.tfo}`, 'tfo');

    // udp
    appendIfPresent(`,udp-relay=${proxy.udp}`, 'udp');

    // tag
    append(`,tag=${proxy.name}`);

    return result.toString();
}

function shadowsocksr(proxy) {
    const result = new Result(proxy);
    const append = result.append.bind(result);
    const appendIfPresent = result.appendIfPresent.bind(result);

    append(`shadowsocksr=${proxy.server}:${proxy.port}`);
    append(`,method=${proxy.cipher}`);
    append(`,password=${proxy.password}`);

    // ssr protocol
    append(`,ssr-protocol=${proxy.protocol}`);
    appendIfPresent(
        `,ssr-proctol-param=${proxy['proctol-param']}`,
        'proctol-param',
    );

    // obfs
    appendIfPresent(`,obfs=${proxy.obfs}`, 'obfs');
    appendIfPresent(`,obfs-host=${proxy['obfs-param']}`, 'obfs-param');

    // tfo
    appendIfPresent(`,fast-open=${proxy.tfo}`, 'tfo');

    // udp
    appendIfPresent(`,udp-relay=${proxy.udp}`, 'udp');

    // tag
    append(`,tag=${proxy.name}`);

    return result.toString();
}

function trojan(proxy) {
    const result = new Result(proxy);
    const append = result.append.bind(result);
    const appendIfPresent = result.appendIfPresent.bind(result);

    append(`trojan=${proxy.server}:${proxy.port}`);
    append(`,password=${proxy.password}`);

    // obfs ws
    if (proxy.network === 'ws') {
        if (proxy.tls) append(`,obfs=wss`);
        else append(`,obfs=ws`);
        appendIfPresent(`,obfs-uri=${proxy['ws-opts'].path}`, 'ws-opts.path');
        appendIfPresent(
            `,obfs-host=${proxy['ws-opts'].headers.Host}`,
            'ws-opts.headers.Host',
        );
    }

    // tls
    appendIfPresent(`,over-tls=${proxy.tls}`, 'tls');

    // tls verification
    appendIfPresent(
        `,tls-verification=${!proxy['skip-cert-verify']}`,
        'skip-cert-verify',
    );
    appendIfPresent(`,tls-host=${proxy.sni}`, 'sni');

    // tfo
    appendIfPresent(`,fast-open=${proxy.tfo}`, 'tfo');

    // udp
    appendIfPresent(`,udp-relay=${proxy.udp}`, 'udp');

    // tag
    append(`,tag=${proxy.name}`);

    return result.toString();
}

function vmess(proxy) {
    const result = new Result(proxy);
    const append = result.append.bind(result);
    const appendIfPresent = result.appendIfPresent.bind(result);

    append(`vmess=${proxy.server}:${proxy.port}`);
    append(`,method=${proxy.method}`);
    append(`,password=${proxy.uuid}`);

    // obfs
    if (proxy.network === 'ws') {
        if (proxy.tls) append(`,obfs=wss`);
        else append(`,obfs=ws`);
        appendIfPresent(`,obfs-uri=${proxy['ws-opts'].path}`, 'ws-opts.path');
        appendIfPresent(
            `,obfs-host=${proxy['ws-opts'].headers.Host}`,
            'ws-opts.headers.Host',
        );
    } else if (proxy.network === 'http') {
        append(`,obfs=http`);
        appendIfPresent(
            `,obfs-uri=${proxy['http-opts'].path}`,
            'http-opts.path',
        );
        appendIfPresent(
            `,obfs-host=${proxy['http-opts'].headers.Host}`,
            'http-opts.headers.Host',
        );
    }

    // tls verification
    appendIfPresent(
        `,tls-verification=${!proxy['skip-cert-verify']}`,
        'skip-cert-verify',
    );
    appendIfPresent(`,tls-host=${proxy.sni}`, 'sni');

    // AEAD
    appendIfPresent(`,aead=${proxy.alterId === 0}`, 'alterId');

    // tfo
    appendIfPresent(`,fast-open=${proxy.tfo}`, 'tfo');

    // udp
    appendIfPresent(`,udp-relay=${proxy.udp}`, 'udp');

    // tag
    append(`,tag=${proxy.name}`);

    return result.toString();
}

function http(proxy) {
    const result = new Result(proxy);
    const append = result.append.bind(result);
    const appendIfPresent = result.appendIfPresent.bind(result);

    append(`http=${proxy.server}:${proxy.port}`);
    appendIfPresent(`,username=${proxy.username}`, 'username');
    appendIfPresent(`,password=${proxy.password}`, 'password');

    // tls
    appendIfPresent(`,over-tls=${proxy.tls}`, 'tls');

    // tls verification
    appendIfPresent(
        `,tls-verification=${!proxy['skip-cert-verify']}`,
        'skip-cert-verify',
    );
    appendIfPresent(`,tls-host=${proxy.sni}`, 'sni');

    // tfo
    appendIfPresent(`,fast-open=${proxy.tfo}`, 'tfo');

    // udp
    appendIfPresent(`,udp-relay=${proxy.udp}`, 'udp');

    // tag
    append(`,tag=${proxy.name}`);

    return result.toString();
}

function socks5(proxy) {
    const result = new Result(proxy);
    const append = result.append.bind(result);
    const appendIfPresent = result.appendIfPresent.bind(result);

    append(`socks5=${proxy.server}:${proxy.port}`);
    appendIfPresent(`,username=${proxy.username}`, 'username');
    appendIfPresent(`,password=${proxy.password}`, 'password');

    // tls
    appendIfPresent(`,over-tls=${proxy.tls}`, 'tls');

    // tls verification
    appendIfPresent(
        `,tls-verification=${!proxy['skip-cert-verify']}`,
        'skip-cert-verify',
    );
    appendIfPresent(`,tls-host=${proxy.sni}`, 'sni');

    // tfo
    appendIfPresent(`,fast-open=${proxy.tfo}`, 'tfo');

    // udp
    appendIfPresent(`,udp-relay=${proxy.udp}`, 'udp');

    // tag
    append(`,tag=${proxy.name}`);

    return result.toString();
}
