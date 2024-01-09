export default interface IIndexer {
    onAddRecord: (topic: string, event: any) => void;
    onAddTopic: (topic: string) => void;
    subscribe: (topic: string, callback: any) => void;
  }