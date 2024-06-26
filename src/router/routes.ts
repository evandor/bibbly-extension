import {RouteRecordRaw} from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/sidepanel/welcome' // redirects to /sidepanel if there is at least one project (i.e. tabset)
  },
  {
    path: '/sidepanel',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('pages/SidePanelPage.vue')}],
  },
  {
    path: '/sidepanel/welcome',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('pages/sidepanel/WelcomePage.vue')}],
  },
  {
    path: '/sidepanel/projects',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('src/projects/pages/SidePanelProjectsPage.vue')}],
  },
  {
    path: '/sidepanel/source/:sourceId',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('src/projects/pages/SidePanelSourcePage.vue')}],
  },
  {
    path: '/mainpanel/settings',
    component: () => import('layouts/PlainWithRightDrawerLayout.vue'),
    children: [{path: '', component: () => import('pages/SettingsPage.vue')}],
  },
  {
    path: '/mainpanel/features/:feature',
    component: () => import('layouts/PlainWithRightDrawerLayout.vue'),
    children: [{path: '', component: () => import('pages/FeaturesPage.vue')}],
  },
  {
    path: '/mainpanel/html/:tabId/:blobId',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{path: '', component: () => import('src/snapshots/pages/MainPanelHtmlPage.vue')}],
  },
  {
    path: '/features/:feature',
    component: () => import('layouts/FullPageLayout.vue'),
    children: [{path: '', component: () => import('pages/FeaturesPage.vue')}],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
