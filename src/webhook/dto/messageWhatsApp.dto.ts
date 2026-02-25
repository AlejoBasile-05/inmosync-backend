export class messageWhatsAppDto {
    entry: {
        changes: {
            value: {
                messages: {
                    text: {
                        body: string;
                    };
                    from: string;
                }[];
                contacts: {
                    profile: {
                        name: string;
                    };
                }[];
            };
        }[];
    }[];
}