import {
  APPLICATION_DESCRIPTION,
  APPLICATION_NAME,
  APPLICATION_URL,
} from '../utils/Brand';

export type IMetaData = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
};

export const META_ACTIONS = '@Meta';
export const META_UPDATE = `${META_ACTIONS}/Update`;
export const MetaActions = {
  update: (data: IMetaData) => {
    return {
      type: META_UPDATE,
      value: {
        title: data.title || APPLICATION_NAME,
        description: data.description || APPLICATION_DESCRIPTION,
        url: data.url || APPLICATION_URL,
        image: data.image || `${APPLICATION_URL}ogp_image.png`,
      },
    };
  },
  initialize: () => {
    return MetaActions.update({});
  },
};
