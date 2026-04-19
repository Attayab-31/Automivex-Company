/**
 * Admin Store (Zustand)
 * Centralized state management for admin panel
 * Handles: auth state, UI state, content state, etc.
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useAdminStore = create(
  immer((set) => ({
    // Auth state
    isAuthenticated: false,
    admin: null,
    isCheckingAuth: true,
    authError: null,

    // UI state
    activeContentTab: "hero",
    isDraftSaving: false,
    isContentPublishing: false,
    showPublishConfirm: false,
    uiMessage: null,
    uiError: null,

    // Content state
    draftContent: null,
    publishedContent: null,
    isContentLoading: true,
    contentError: null,
    hasUnsavedChanges: false,

    // Auth actions
    setAuthenticated: (isAuthenticated, admin = null) =>
      set((state) => {
        state.isAuthenticated = isAuthenticated;
        state.admin = admin;
        state.isCheckingAuth = false;
      }),

    setAuthError: (error) =>
      set((state) => {
        state.authError = error;
      }),

    setCheckingAuth: (checking) =>
      set((state) => {
        state.isCheckingAuth = checking;
      }),

    clearAuth: () =>
      set((state) => {
        state.isAuthenticated = false;
        state.admin = null;
        state.authError = null;
      }),

    // UI actions
    setActiveTab: (tabId) =>
      set((state) => {
        state.activeContentTab = tabId;
      }),

    setDraftSaving: (isSaving) =>
      set((state) => {
        state.isDraftSaving = isSaving;
      }),

    setPublishing: (isPublishing) =>
      set((state) => {
        state.isContentPublishing = isPublishing;
      }),

    setShowPublishConfirm: (show) =>
      set((state) => {
        state.showPublishConfirm = show;
      }),

    setUIMessage: (message, type = "info") =>
      set((state) => {
        state.uiMessage = message ? { text: message, type } : null;
      }),

    setUIError: (error) =>
      set((state) => {
        state.uiError = error;
      }),

    clearMessages: () =>
      set((state) => {
        state.uiMessage = null;
        state.uiError = null;
      }),

    // Content actions
    setContentLoading: (isLoading) =>
      set((state) => {
        state.isContentLoading = isLoading;
      }),

    setDraftContent: (content) =>
      set((state) => {
        state.draftContent = content;
        state.hasUnsavedChanges = false;
      }),

    setPublishedContent: (content) =>
      set((state) => {
        state.publishedContent = content;
      }),

    setHasUnsavedChanges: (hasChanges) =>
      set((state) => {
        state.hasUnsavedChanges = hasChanges;
      }),

    updateDraftContent: (updates) =>
      set((state) => {
        if (state.draftContent) {
          state.draftContent = { ...state.draftContent, ...updates };
          state.hasUnsavedChanges = true;
        }
      }),

    setContentError: (error) =>
      set((state) => {
        state.contentError = error;
      }),

    loadContent: (draft, published) =>
      set((state) => {
        state.draftContent = draft;
        state.publishedContent = published;
        state.isContentLoading = false;
        state.contentError = null;
        state.hasUnsavedChanges = false;
      }),

    // Reset all state
    resetStore: () =>
      set(() => ({
        isAuthenticated: false,
        admin: null,
        isCheckingAuth: true,
        authError: null,
        activeContentTab: "hero",
        isDraftSaving: false,
        isContentPublishing: false,
        showPublishConfirm: false,
        uiMessage: null,
        uiError: null,
        draftContent: null,
        publishedContent: null,
        isContentLoading: true,
        contentError: null,
        hasUnsavedChanges: false,
      })),
  }))
);
