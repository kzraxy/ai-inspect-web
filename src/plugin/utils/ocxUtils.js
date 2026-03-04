import { getInitData, getInitConfig } from '@/plugin/http/proxy'

export function getOCXInitInfo (args, deviceSerial) {
  const requests = [getInitData({ publicKey: args.pubkey, deviceSerial: deviceSerial })]
  // const requests = [getInitData({ publicKey: args.pubkey })]
  if (args.configKeys && args.configKeys.length > 0) {
    requests.push(getInitConfig({ keys: args.configKeys }).catch(() => Promise.resolve()))
  }
  return Promise.all(requests).then(res => {
    const info = res[0]
    if (info.data) {
      info.data.isEncrypt = 1
      if (res[1] && res[1].data) {
        Object.assign(info.data, res[1].data)
      }
    }
    return info
  })
}
