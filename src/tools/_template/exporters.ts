import { makeJsonExporters } from '../exporters.helpers'

// makeJsonExporters generates both "Export JSON (plain)" and "Export JSON (encrypted)"
// Pass your tool's id as the filename prefix.
// To add a PDF exporter, push a new Exporter object to this array.
const exporters = makeJsonExporters('my-tool-id')
export default exporters
