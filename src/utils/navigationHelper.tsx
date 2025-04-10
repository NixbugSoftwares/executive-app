// navigationHelper.ts
let navigateRef: any;
let globalNavigate: any; // Add this line

export const setNavigate = (navigate: any) => {
  navigateRef = navigate;
};

export const setGlobalNavigate = (navigate: any) => { // Add this export
  globalNavigate = navigate;
};

export const navigate = (path: string) => {
  if (navigateRef) {
    navigateRef(path);
  } else {
    window.location.href = path;
  }
};