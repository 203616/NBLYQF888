const path = require('path')

function runReleaseChecklist() {
  const core = require(path.join(__dirname, '../../../../scripts/release-checklist-core'))
  return core.runReleaseChecklist()
}

module.exports = { runReleaseChecklist }
