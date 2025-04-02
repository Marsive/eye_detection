module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5000/api', // 要代理到的目标服务器
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '', // 可选的路径重写规则
                },
            },
        },
    },
};