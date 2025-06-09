import { execSync } from 'child_process'
import process from 'process'

function execShellCommandSync(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf8' }).trim()
    } catch (error) {
        return 'unknown'
    }
}

export const ViteRevisionPlugin = (mode) => ({
    name: 'vite-revision',
    config() {
        const latestTag = mode === 'development' ? 'development' : execShellCommandSync('git describe --tags --abbrev=0')
        const latestCommitHash = mode === 'development' ? 'development' : execShellCommandSync('git rev-parse HEAD')

        process.env.VITE_GIT_TAG = latestTag === 'unknown' ? 'latest' : latestTag
        process.env.VITE_GIT_COMMIT_HASH = latestCommitHash === 'unknown' ? 'unknown' : latestCommitHash.substring(0, 7)
    }
})
