import {RouteRecordRaw} from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    //redirect: '/sidepanel/welcome'
    redirect: (process.env.MODE === 'pwa' || process.env.MODE === 'spa') ?
      '/mainpanel/welcome' :
      '/sidepanel/welcome' // redirects to /sidepanel if there is at least one project (i.e. tabset)
  },
  {
    path: '/sidepanel',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('pages/SidePanelPage.vue')}],
  },
  {
    path: '/sidepanel/collections',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('pages/SidePanelCollectionsPage.vue')}],
  },
  {
    path: '/sidepanel/login',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('pages/SidePanelLoginPage.vue')}],
  },
  {
    path: '/sidepanel/welcome',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('pages/sidepanel/WelcomePage.vue')}],
  },
  // {
  //   path: '/sidepanel/projects',
  //   component: () => import('layouts/SidePanelLayout.vue'),
  //   children: [{path: '', component: () => import('src/projects/pages/SidePanelProjectsPage.vue')}],
  // },
  {
    path: '/sidepanel/research/:sourceId',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('src/pages/SidePanelResearchPage.vue')}],
  },
  {
    path: '/mainpanel',
    component: () => import('layouts/PlainWithRightDrawerLayout.vue'),
    children: [{path: '', component: () => import('pages/mainpanel/MainPanelPage.vue')}],
  },
  {
    path: '/mainpanel/welcome',
    component: () => import('layouts/PlainWithRightDrawerLayout.vue'),
    children: [{path: '', component: () => import('pages/mainpanel/WelcomePage.vue')}],
  },
  {
    path: '/mainpanel/settings',
    component: () => import('layouts/PlainWithRightDrawerLayout.vue'),
    children: [{path: '', component: () => import('pages/SettingsPage.vue')}],
  },
  {
    path: '/mainpanel/features/:feature',
    component: () => import('layouts/PlainWithRightDrawerLayout.vue'),
    children: [{path: '', component: () => import('src/features/pages/FeaturesPage.vue')}],
  },
  {
    path: '/mainpanel/notes/:noteId/edit', // editorjs setup cannot toggle between readonly/write mode
    component: () => import('layouts/PlainLayout.vue'),
    children: [{path: '', component: () => import('src/notes/pages/mainpanel/MainPanelNotePage.vue')}],
  },
  {
    path: '/mainpanel/notes/:noteId',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{path: '', component: () => import('src/notes/pages/mainpanel/MainPanelNotePage.vue')}],
  },
  {
    path: '/mainpanel/notes/',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{path: '', component: () => import('src/notes/pages/mainpanel/MainPanelNotePage.vue')}],
  },
  {
    path: '/mainpanel/html/:snapshotId', // both MHtml and HTML managed by same page
    component: () => import('layouts/PlainLayout.vue'),
    children: [{path: '', component: () => import('src/snapshots/pages/MainPanelMHtmlPage.vue')}],
  },
  {
    path: '/mainpanel/mhtml/:snapshotId',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{path: '', component: () => import('src/snapshots/pages/MainPanelMHtmlPage.vue')}],
  },
  {
    path: '/mainpanel/png/:snapshotId',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{path: '', component: () => import('src/snapshots/pages/MainPanelPngPage.vue')}],
  },
  {
    path: '/mainpanel/pdf/:snapshotId',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{path: '', component: () => import('src/snapshots/pages/MainPanelPdfPage.vue')}],
  },
  {
    path: '/mainpanel/share-preview/:tabsetId',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{path: '', component: () => import('src/tabsets/pages/MainPanelSharePreviewPage.vue')}],
  },
  {
    path: '/pwa/imp/:sharedId',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{ path: '', component: () => import('src/tabsets/pages/sharing/ImportPublicTabsetPage.vue') }],
  },
  {
    path: '/pwa/tabsets/:tabsetId',
    component: () => import('layouts/PwaPageLayout.vue'),
    children: [{ path: '', component: () => import('src/tabsets/pages/pwa/PwaTabsetPage.vue') }],
  },

  {
    path: '/features/:feature',
    component: () => import('layouts/FullPageLayout.vue'),
    children: [{path: '', component: () => import('src/features/pages/FeaturesPage.vue')}],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
