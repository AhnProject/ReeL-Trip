const nodeExternals = require("webpack-node-externals");
const path = require("path");
const fs = require("fs");

// 로컬 node_modules에 rxjs가 있으면 사용, 없으면 루트(호이스팅된) 경로 사용
const localRxjs = path.resolve(__dirname, "node_modules/rxjs");
const rootRxjs = path.resolve(__dirname, "../../node_modules/rxjs");
const rxjsPath = fs.existsSync(localRxjs) ? localRxjs : rootRxjs;

module.exports = function (options) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      alias: {
        ...options.resolve?.alias,
        // 모노레포 중복 rxjs 버전 충돌 방지: 단일 rxjs 인스턴스로 고정
        rxjs: rxjsPath,
        "rxjs/operators": path.join(rxjsPath, "operators"),
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
