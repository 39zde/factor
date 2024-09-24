import type { LanguageSetting, DataBaseNames } from '@type';
export function getDataBaseDisplayName(lang: LanguageSetting, dataBaseName: DataBaseNames | undefined): string {
	switch (dataBaseName) {
		case 'article_db':
			return lang === 'deutsch' ? 'Artikel' : 'Articles';
		case 'customer_db':
			return lang === 'deutsch' ? 'Kunden' : 'Customers';
		case 'document_db':
			return lang === 'deutsch' ? 'Dokumente' : 'Documents';
		default:
			return '';
	}
}
