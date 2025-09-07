import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(const Locale('en')) {
    _loadSavedLocale();
  }

  static const _localeKey = 'selected_locale';

  Future<void> _loadSavedLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final localeCode = prefs.getString(_localeKey) ?? 'en';
    state = Locale(localeCode);
  }

  Future<void> setLocale(Locale newLocale) async {
    if (newLocale.languageCode != state.languageCode) {
      state = newLocale;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_localeKey, newLocale.languageCode);
    }
  }

  Locale get currentLocale => state;
}

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});