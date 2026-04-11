package edu.cit.taghoy.lostlink.util;

/**
 * Stores contact preference as one column: {@code platform + "|||" + details}.
 * Legacy rows without the delimiter decode as empty platform and full string as details.
 */
public final class ContactPreferenceCodec {

    public static final String SEP = "|||";

    private ContactPreferenceCodec() {
    }

    public static String encode(String platform, String details) {
        String p = platform == null ? "" : platform.trim();
        String d = details == null ? "" : details.trim();
        if (p.isEmpty() && d.isEmpty()) {
            return null;
        }
        return p + SEP + d;
    }

    public static String[] decode(String stored) {
        if (stored == null || stored.isBlank()) {
            return new String[] { "", "" };
        }
        int i = stored.indexOf(SEP);
        if (i < 0) {
            return new String[] { "", stored.trim() };
        }
        return new String[] {
                stored.substring(0, i).trim(),
                stored.substring(i + SEP.length()).trim()
        };
    }
}
