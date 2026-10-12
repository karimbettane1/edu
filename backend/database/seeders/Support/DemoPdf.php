<?php

namespace Database\Seeders\Support;

class DemoPdf
{
    /**
     * Build a minimal valid single-page PDF containing the given text.
     *
     * @param  array<int, string>  $lines
     */
    public static function generate(string $title, array $lines = []): string
    {
        $content = "BT /F1 20 Tf 60 780 Td 26 TL\n";
        $content .= '('.self::escape($title).") Tj T*\n";
        $content .= "/F1 12 Tf\n";
        foreach ($lines as $line) {
            $content .= '('.self::escape($line).") Tj T*\n";
        }
        $content .= 'ET';

        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
            "<< /Length ".strlen($content)." >>\nstream\n".$content."\nendstream",
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $index => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($index + 1)." 0 obj\n".$object."\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $count = count($objects) + 1;
        $pdf .= "xref\n0 {$count}\n0000000000 65535 f \n";
        foreach ($offsets as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }
        $pdf .= "trailer\n<< /Size {$count} /Root 1 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }

    public static function toAscii(string $text): string
    {
        return strtr($text, [
            'à' => 'a', 'â' => 'a', 'ä' => 'a', 'á' => 'a', 'ã' => 'a',
            'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
            'î' => 'i', 'ï' => 'i', 'í' => 'i',
            'ô' => 'o', 'ö' => 'o', 'ó' => 'o', 'õ' => 'o',
            'ù' => 'u', 'û' => 'u', 'ü' => 'u', 'ú' => 'u',
            'ç' => 'c', 'ñ' => 'n', 'œ' => 'oe', 'æ' => 'ae',
            'À' => 'A', 'Â' => 'A', 'É' => 'E', 'È' => 'E', 'Ê' => 'E',
            'Î' => 'I', 'Ô' => 'O', 'Ù' => 'U', 'Û' => 'U', 'Ç' => 'C',
            '’' => "'", '—' => '-', '–' => '-', '…' => '...', '«' => '"', '»' => '"',
        ]);
    }

    private static function escape(string $text): string
    {
        $text = self::toAscii($text);

        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
    }
}
