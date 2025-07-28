// Content versioning and update tracking system

import { ContentVersion, ContentMetadata, ContentBackup } from './types';
import { createHash } from 'crypto';

export class ContentVersionManager {
  private static backups: Map<string, ContentBackup[]> = new Map();
  private static versionHistory: Map<string, ContentVersion[]> = new Map();

  /**
   * Create a new version for content
   */
  static createVersion(
    contentId: string,
    author: string,
    changes: string[],
    data: any
  ): ContentVersion {
    const timestamp = new Date().toISOString();
    const hash = this.generateContentHash(data);
    
    // Get current version number
    const history = this.versionHistory.get(contentId) || [];
    const currentVersion = history.length > 0 
      ? this.incrementVersion(history[history.length - 1].version)
      : '1.0.0';

    const version: ContentVersion = {
      version: currentVersion,
      timestamp,
      author,
      changes,
      hash
    };

    // Update version history
    history.push(version);
    this.versionHistory.set(contentId, history);

    return version;
  }

  /**
   * Generate content hash for change detection
   */
  private static generateContentHash(data: any): string {
    const contentString = JSON.stringify(data, Object.keys(data).sort());
    return createHash('sha256').update(contentString).digest('hex').substring(0, 16);
  }

  /**
   * Increment version number
   */
  private static incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.').map(Number);
    
    // Increment patch version by default
    parts[2] = (parts[2] || 0) + 1;
    
    return parts.join('.');
  }

  /**
   * Increment minor version
   */
  static incrementMinorVersion(currentVersion: string): string {
    const parts = currentVersion.split('.').map(Number);
    parts[1] = (parts[1] || 0) + 1;
    parts[2] = 0; // Reset patch version
    return parts.join('.');
  }

  /**
   * Increment major version
   */
  static incrementMajorVersion(currentVersion: string): string {
    const parts = currentVersion.split('.').map(Number);
    parts[0] = (parts[0] || 0) + 1;
    parts[1] = 0; // Reset minor version
    parts[2] = 0; // Reset patch version
    return parts.join('.');
  }

  /**
   * Create backup before update
   */
  static createBackup(
    contentId: string,
    contentType: string,
    data: any,
    version: ContentVersion,
    reason: ContentBackup['reason'] = 'manual'
  ): ContentBackup {
    const backup: ContentBackup = {
      id: `backup_${contentId}_${Date.now()}`,
      contentId,
      contentType,
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      version,
      createdAt: new Date().toISOString(),
      reason
    };

    // Store backup
    const contentBackups = this.backups.get(contentId) || [];
    contentBackups.push(backup);
    this.backups.set(contentId, contentBackups);

    // Keep only last 10 backups per content item
    if (contentBackups.length > 10) {
      contentBackups.splice(0, contentBackups.length - 10);
    }

    return backup;
  }

  /**
   * Get version history for content
   */
  static getVersionHistory(contentId: string): ContentVersion[] {
    return this.versionHistory.get(contentId) || [];
  }

  /**
   * Get latest version for content
   */
  static getLatestVersion(contentId: string): ContentVersion | null {
    const history = this.getVersionHistory(contentId);
    return history.length > 0 ? history[history.length - 1] : null;
  }

  /**
   * Get backups for content
   */
  static getBackups(contentId: string): ContentBackup[] {
    return this.backups.get(contentId) || [];
  }

  /**
   * Restore content from backup
   */
  static restoreFromBackup(backupId: string): any | null {
    for (const [contentId, backups] of this.backups.entries()) {
      const backup = backups.find(b => b.id === backupId);
      if (backup) {
        return JSON.parse(JSON.stringify(backup.data)); // Deep clone
      }
    }
    return null;
  }

  /**
   * Compare two versions
   */
  static compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }

    return 0;
  }

  /**
   * Check if content has changed
   */
  static hasContentChanged(contentId: string, newData: any): boolean {
    const latestVersion = this.getLatestVersion(contentId);
    if (!latestVersion) return true;

    const newHash = this.generateContentHash(newData);
    return newHash !== latestVersion.hash;
  }

  /**
   * Get content changes between versions
   */
  static getChangesBetweenVersions(
    contentId: string,
    fromVersion: string,
    toVersion: string
  ): {
    added: string[];
    modified: string[];
    removed: string[];
  } {
    const history = this.getVersionHistory(contentId);
    const fromVersionData = history.find(v => v.version === fromVersion);
    const toVersionData = history.find(v => v.version === toVersion);

    if (!fromVersionData || !toVersionData) {
      return { added: [], modified: [], removed: [] };
    }

    // This is a simplified implementation
    // In a real scenario, you'd need to store the actual data or diffs
    return {
      added: toVersionData.changes.filter(change => change.startsWith('Added')),
      modified: toVersionData.changes.filter(change => change.startsWith('Modified')),
      removed: toVersionData.changes.filter(change => change.startsWith('Removed'))
    };
  }

  /**
   * Clean up old versions and backups
   */
  static cleanup(contentId: string, keepVersions: number = 5, keepBackups: number = 10): void {
    // Clean up version history
    const history = this.versionHistory.get(contentId) || [];
    if (history.length > keepVersions) {
      const trimmedHistory = history.slice(-keepVersions);
      this.versionHistory.set(contentId, trimmedHistory);
    }

    // Clean up backups
    const backups = this.backups.get(contentId) || [];
    if (backups.length > keepBackups) {
      const trimmedBackups = backups.slice(-keepBackups);
      this.backups.set(contentId, trimmedBackups);
    }
  }

  /**
   * Export version history
   */
  static exportVersionHistory(contentId: string): {
    contentId: string;
    versions: ContentVersion[];
    backups: ContentBackup[];
    exportedAt: string;
  } {
    return {
      contentId,
      versions: this.getVersionHistory(contentId),
      backups: this.getBackups(contentId),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import version history
   */
  static importVersionHistory(data: {
    contentId: string;
    versions: ContentVersion[];
    backups: ContentBackup[];
  }): void {
    this.versionHistory.set(data.contentId, data.versions);
    this.backups.set(data.contentId, data.backups);
  }

  /**
   * Get version statistics
   */
  static getVersionStats(contentId: string): {
    totalVersions: number;
    totalBackups: number;
    firstVersion: string | null;
    latestVersion: string | null;
    lastModified: string | null;
    authors: string[];
  } {
    const history = this.getVersionHistory(contentId);
    const backups = this.getBackups(contentId);

    const authors = Array.from(new Set(history.map(v => v.author)));

    return {
      totalVersions: history.length,
      totalBackups: backups.length,
      firstVersion: history.length > 0 ? history[0].version : null,
      latestVersion: history.length > 0 ? history[history.length - 1].version : null,
      lastModified: history.length > 0 ? history[history.length - 1].timestamp : null,
      authors
    };
  }
}

/**
 * Content update tracker utility
 */
export class ContentUpdateTracker {
  private static updateLog: Map<string, {
    contentId: string;
    updates: {
      timestamp: string;
      field: string;
      oldValue: any;
      newValue: any;
      author: string;
    }[];
  }> = new Map();

  /**
   * Track field update
   */
  static trackUpdate(
    contentId: string,
    field: string,
    oldValue: any,
    newValue: any,
    author: string
  ): void {
    const log = this.updateLog.get(contentId) || { contentId, updates: [] };
    
    log.updates.push({
      timestamp: new Date().toISOString(),
      field,
      oldValue,
      newValue,
      author
    });

    this.updateLog.set(contentId, log);
  }

  /**
   * Get update history for content
   */
  static getUpdateHistory(contentId: string): {
    contentId: string;
    updates: {
      timestamp: string;
      field: string;
      oldValue: any;
      newValue: any;
      author: string;
    }[];
  } | null {
    return this.updateLog.get(contentId) || null;
  }

  /**
   * Get recent updates across all content
   */
  static getRecentUpdates(limit: number = 10): {
    contentId: string;
    field: string;
    timestamp: string;
    author: string;
  }[] {
    const allUpdates: {
      contentId: string;
      field: string;
      timestamp: string;
      author: string;
    }[] = [];

    for (const [contentId, log] of this.updateLog.entries()) {
      log.updates.forEach(update => {
        allUpdates.push({
          contentId,
          field: update.field,
          timestamp: update.timestamp,
          author: update.author
        });
      });
    }

    return allUpdates
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Clear update history for content
   */
  static clearUpdateHistory(contentId: string): void {
    this.updateLog.delete(contentId);
  }
}