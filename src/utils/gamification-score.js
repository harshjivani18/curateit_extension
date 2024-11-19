import * as AudioActionTypes            from '../actions/audios/action-types'
import * as CodeActionTypes             from '../actions/code/action-types'
import * as CollectionActionTypes       from '../actions/collection/action-types'
import * as CustomActionTypes           from '../actions/customApplication/action-types'
import * as GemActionTypes              from '../actions/gem/action-types'
import * as AllGemsActionTypes          from '../actions/gems/action-types'
import * as HighlightActionTypes        from '../actions/highlights/action-types'
import * as ImageActionTypes            from '../actions/image/action-types'
import * as PDFActionTypes              from '../actions/pdf/action-types'
import * as SubCollectionActionTypes    from '../actions/subcollection/action-types'
import * as UploadActionTypes           from '../actions/upload/action-types'
import * as VideoActionTypes            from '../actions/videos/action-types'

export const GAMIFICATION_ACTIONS = [
    { type: AudioActionTypes.CREATE_AUDIO, module: ["gem"] },
    { type: CodeActionTypes.ADD_CODE, module: ["gem"] },
    { type: CodeActionTypes.DELETE_CODE, module: ["gem"] },
    // { type: CollectionActionTypes.IMPORTCOL, module: ["collection", "gem"] },
    { type: CollectionActionTypes.ADD_COLLECTION, module: ["collection"] },
    // { type: CollectionActionTypes.ADD_IMPORT_COLLECTION, module: ["collection"] },
    { type: CollectionActionTypes.DELETE_COLLECTION, module: ["collection"] },
    { type: CollectionActionTypes.DELETE_ALL_COLLECTIONS, module: ["collection"] },
    { type: CustomActionTypes.UPLOAD_FILE_LOCAL, module: ["gem"] },
    { type: GemActionTypes.ADD_GEM, module: ["gem"] },
    // { type: GemActionTypes.IMPORT_GEM, module: ["gem"] },
    // { type: GemActionTypes.IMPORT_GEMS_WITH_ICON, module: ["gem"] },
    { type: GemActionTypes.DELETEGEM, module: ["gem"] },
    { type: AllGemsActionTypes.ADD_GEM, module: ["gem"] },
    // { type: AllGemsActionTypes.IMPORT_GEM, module: ["gem"] },
    { type: AllGemsActionTypes.DELETE_GEM, module: ["gem"] },
    { type: AllGemsActionTypes.DELETE_ALL_GEMS, module: ["gem"] },
    { type: HighlightActionTypes.ADD_HIGHLIGHT, module: ["gem"] },
    { type: HighlightActionTypes.DELETE_HIGHLIGHT, module: ["gem"] },
    { type: ImageActionTypes.ADD_IMAGE, module: ["gem"] },
    { type: ImageActionTypes.EXTRACT_IMAGE_TEXT, module: ["gem"] },
    { type: ImageActionTypes.DELETE_IMAGE, module: ["gem"] },
    { type: PDFActionTypes.ADD_PDF_HIGHLIGHT, module: ["gem"] },
    { type: PDFActionTypes.DELETE_PDF_HIGHLIGHT, module: ["gem"] },
    { type: PDFActionTypes.UPLOAD_PDF, module: ["gem"] },
    { type: SubCollectionActionTypes.DELETE_SUBCOLLECTION, module: ["collection", "gem"] },
    { type: UploadActionTypes.ADD_UPLOAD_FILE, module: ["gem"] },
    { type: VideoActionTypes.CREATE_VIDEO, module: ["gem"] }
]