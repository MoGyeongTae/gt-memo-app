const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Rust 서버(server/)는 앱 번들과 상관없고, 빌드 결과물(server/target)이 매우 커서
// Metro 가 파일을 감시하거나 모듈을 찾을 때 제외한다.
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const serverDir = path.join(__dirname, 'server');
config.resolver.blockList = [
  ...[].concat(config.resolver.blockList ?? []),
  new RegExp(`^${escapeRegExp(serverDir)}[\\\\/].*`), // 절대 경로
  /^server[\\/].*/, // 프로젝트 기준 상대 경로
];

module.exports = withNativeWind(config, { input: './src/global.css' });
