// User identification utility for IP-based separation
export class UserIdentification {
  private static userId: string | null = null;

  // Get unique user identifier (IP-based or device-based)
  static async getUserId(): Promise<string> {
    if (this.userId) {
      return this.userId;
    }

    try {
      // Try to get IP address for user identification
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      this.userId = `ip-${data.ip}`;
      return this.userId;
    } catch (error) {
      // Fallback to device fingerprint if IP fetch fails
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx?.fillText('device-fingerprint', 10, 10);
      const fingerprint = canvas.toDataURL() + navigator.userAgent + screen.width + screen.height;
      this.userId = `device-${btoa(fingerprint).slice(0, 16)}`;
      return this.userId;
    }
  }

  // Get storage key for current user
  static async getStorageKey(baseKey: string): Promise<string> {
    const userId = await this.getUserId();
    return `${baseKey}-${userId}`;
  }

  // Clear user ID (for testing or logout)
  static clearUserId(): void {
    this.userId = null;
  }
}
