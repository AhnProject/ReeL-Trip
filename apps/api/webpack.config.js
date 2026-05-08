const nodeExternals = require("webpack-node-externals");
const path = require("path");

module.exports = function (options) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      alias: {
        ...options.resolve?.alias,
        // 모노레포 중복 rxjs 버전 충돌 방지: 항상 로컬 api 패키지의 rxjs를 사용
        rxjs: path.resolve(__dirname, "node_modules/rxjs"),
        "rxjs/operators": path.resolve(__dirname, "node_modules/rxjs/operators"),
      },
    },
    externals: [
      nodeExternals({
        // @reel-trip/* 워크스페이스 패키지는 번들에 포함 (TS 소스 직접 참조)
        allowlist: [/@reel-trip\/.*/],
      }),
    ],
  };
};
