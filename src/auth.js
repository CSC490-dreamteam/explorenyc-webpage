const Auth = {
  currentUserId: null,
  setCurrentUserId(id) {
    this.currentUserId = id;
    console.log('Auth: currentUserId set to', id);
  }
};
export default Auth;
