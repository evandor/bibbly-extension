import _ from "lodash"
import {FeatureIdent, FeatureType} from "src/app/models/FeatureIdent";
import {Feature} from "src/features/models/Feature";

export class AppFeatures {
  features: Feature[] = [

    new Feature(FeatureIdent.WINDOWS_MANAGEMENT, FeatureType.RECOMMENDED, 'Windows Management', 'grid_view', "","", ['bex']),

    new Feature(FeatureIdent.TABSETS_SHARING, FeatureType.EXPERIMENTAL, 'Share your Tabsets',
      'Share tabsets publicly or with specific users. Not available in local persistence mode!', 'o_ios_share', "",['bex']),

    new Feature(FeatureIdent.OPEN_TABS, FeatureType.OPTIONAL, 'Open Tabs', '','o_playlist_add', '',['bex']),
  ]

  getFeature(f: FeatureIdent): Feature | undefined {
    const found = _.filter(this.features, (feature: Feature) => feature.ident === f)
    if (found && found.length > 0) {
      return found[0]
    }
    return undefined
  }

  getFeatures(): Feature[] {
    return this.features
  }
}
