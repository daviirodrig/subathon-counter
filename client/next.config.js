/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    compiler: {
        styledComponents: true
    },
    output: "standalone",
    // experimental: {
    //     styledComponents: true
    // }
}

module.exports = nextConfig
