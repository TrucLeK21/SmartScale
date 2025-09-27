class UserSession {
  static final UserSession _instance = UserSession._internal();

  factory UserSession() {
    return _instance;
  }

  UserSession._internal();

  String? token;

  void updateSession({ String? token}) {
    this.token = token;
  }

  void clear(){
    token = null;
  }
}