module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-safe-area-context의 스펙 파일이 TypeScript `as` 캐스트를 사용해서
      // @react-native/babel-plugin-codegen이 ExportDefaultDeclaration > CallExpression
      // 패턴을 인식하지 못하는 문제를 해결합니다.
      // plugins는 presets보다 먼저 실행되므로 codegen 플러그인이 실행되기 전에 변환됩니다.
      function unwrapCodegenAsExpression() {
        return {
          name: 'unwrap-codegen-as-expression',
          visitor: {
            ExportDefaultDeclaration(path) {
              const decl = path.node.declaration;
              if (
                decl.type === 'TSAsExpression' &&
                decl.expression &&
                decl.expression.type === 'CallExpression'
              ) {
                const callee = decl.expression.callee;
                if (
                  callee.type === 'Identifier' &&
                  callee.name === 'codegenNativeComponent'
                ) {
                  path.node.declaration = decl.expression;
                }
              }
            },
          },
        };
      },
    ],
  };
};
