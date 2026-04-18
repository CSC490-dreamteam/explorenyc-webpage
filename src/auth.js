const Auth = {
  currentUserId: null,
  setCurrentUserId(id) {
    this.currentUserId = id;
    console.log('Auth: currentUserId set to', id);
  }
};
//this will pull from db later
export default Auth;
