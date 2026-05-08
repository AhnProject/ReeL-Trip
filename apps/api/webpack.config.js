const nodeExternals = require("webpack-node-externals");
const path = require("path");

// tsconfig paths와 동일하게 루트 node_modules의 rxjs로 고정
const rootRxjs = path.resolve(__dirname, "../../node_modules/rxjs");

module.exports = function (options) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      alias: {
        ...options.resolve?.alias,
        // 모노레포 중복 rxjs 버전 충돌 방지: tsconfig paths와 동일한 단일 인스턴스
        rxjs: rootRxjs,
        "rxjs/operators": path.join(rootRxjs, "operators"),
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
