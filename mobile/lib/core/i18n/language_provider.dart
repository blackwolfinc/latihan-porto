import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'translations.dart';

class LanguageProvider extends ChangeNotifier {
  String _currentLanguage = 'id';

  String get currentLanguage => _currentLanguage;

  static const languages = [
    {'code': 'id', 'label': 'Bahasa Indonesia', 'flag': '🇮🇩'},
    {'code': 'en', 'label': 'English', 'flag': '🇬🇧'},
    {'code': 'zh', 'label': '中文', 'flag': '🇨🇳'},
  ];

  LanguageProvider() {
    _loadLanguage();
  }

  Future<void> _loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    _currentLanguage = prefs.getString('caritahub_lang') ?? 'id';
    AppTranslations.setLanguage(_currentLanguage);
    notifyListeners();
  }

  Future<void> setLanguage(String lang) async {
    _currentLanguage = lang;
    AppTranslations.setLanguage(lang);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('caritahub_lang', lang);
    notifyListeners();
  }
}
